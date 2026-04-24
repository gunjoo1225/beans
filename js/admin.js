const STORAGE_KEY = 'beans_products';
let currentTags = [];
let editingId = null;

// ===== 관리자 인증 =====
function initAdminAccounts() {
  if (!localStorage.getItem('beans_admin_accounts')) {
    localStorage.setItem('beans_admin_accounts', JSON.stringify([{ id: 'admin', password: 'admin' }]));
  }
}

function checkAdminAuth() {
  const ok = sessionStorage.getItem('beans_admin_session');
  document.getElementById('adminLoginGate').style.display = ok ? 'none' : 'flex';
}

function adminLogin() {
  const id  = document.getElementById('adminLoginId').value.trim();
  const pw  = document.getElementById('adminLoginPw').value;
  const err = document.getElementById('adminLoginError');
  const accounts = JSON.parse(localStorage.getItem('beans_admin_accounts') || '[]');
  const match = accounts.find(a => a.id === id && a.password === pw);
  if (!match) { err.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.'; return; }
  sessionStorage.setItem('beans_admin_session', JSON.stringify({ id }));
  document.getElementById('adminLoginGate').style.display = 'none';
}

function adminLogout() {
  sessionStorage.removeItem('beans_admin_session');
  document.getElementById('adminLoginId').value = '';
  document.getElementById('adminLoginPw').value = '';
  document.getElementById('adminLoginError').textContent = '';
  document.getElementById('adminLoginGate').style.display = 'flex';
}

function addAdminAccount() {
  const id  = document.getElementById('newAdminId').value.trim();
  const pw  = document.getElementById('newAdminPw').value;
  const err = document.getElementById('adminAddError');
  if (!id || !pw) { err.textContent = '아이디와 비밀번호를 모두 입력하세요.'; return; }
  const accounts = JSON.parse(localStorage.getItem('beans_admin_accounts') || '[]');
  if (accounts.find(a => a.id === id)) { err.textContent = '이미 존재하는 아이디입니다.'; return; }
  accounts.push({ id, password: pw });
  localStorage.setItem('beans_admin_accounts', JSON.stringify(accounts));
  document.getElementById('newAdminId').value = '';
  document.getElementById('newAdminPw').value = '';
  err.textContent = '';
  renderAdminAccounts();
  showToast(`관리자 "${id}" 추가 완료`);
}

function deleteAdminAccount(id) {
  const accounts = JSON.parse(localStorage.getItem('beans_admin_accounts') || '[]');
  if (accounts.length <= 1) { showToast('최소 1개의 관리자 계정이 필요합니다.'); return; }
  if (!confirm(`"${id}" 계정을 삭제하시겠습니까?`)) return;
  localStorage.setItem('beans_admin_accounts', JSON.stringify(accounts.filter(a => a.id !== id)));
  renderAdminAccounts();
  showToast(`관리자 "${id}" 삭제 완료`);
}

function renderAdminAccounts() {
  const accounts = JSON.parse(localStorage.getItem('beans_admin_accounts') || '[]');
  const session  = JSON.parse(sessionStorage.getItem('beans_admin_session') || '{}');
  document.getElementById('adminAccountList').innerHTML = accounts.map(a => `
    <div class="admin-account-row">
      <span class="admin-account-id">${a.id} ${a.id === session.id ? '<span class="admin-account-me">(현재 계정)</span>' : ''}</span>
      <span class="admin-account-pw">${a.password}</span>
      ${a.id !== session.id ? `<button class="btn-delete" onclick="deleteAdminAccount('${a.id}')">삭제</button>` : ''}
    </div>
  `).join('');
}

// ===== localStorage 헬퍼 =====
function loadProducts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ===== 목록 렌더링 =====
function renderList() {
  const products = loadProducts();
  document.getElementById('productCount').textContent = products.length;
  const list = document.getElementById('productList');

  if (products.length === 0) {
    list.innerHTML = '<div class="empty-list">등록된 제품이 없습니다.<br>왼쪽 폼에서 첫 번째 제품을 등록해보세요.</div>';
    return;
  }

  list.innerHTML = products.map(p => `
    <div class="list-item">
      <img class="list-thumb"
        src="${p.image || ''}"
        alt="${p.name}"
        onerror="this.src=''; this.style.backgroundColor='#F0EDE6'"
      />
      <div class="list-info">
        <p class="list-region">${p.country.toUpperCase()} · ${p.area.toUpperCase()}</p>
        <p class="list-name">${p.name}</p>
        <p class="list-meta">${capitalize(p.roast)} · ₩${Number(p.prices[200]).toLocaleString('ko-KR')}~</p>
      </div>
      <div class="list-actions">
        <button class="btn-edit" onclick="editProduct('${p.id}')">수정</button>
        <button class="btn-delete" onclick="deleteProduct('${p.id}')">삭제</button>
      </div>
    </div>
  `).join('');
}

// ===== 이미지 탭 전환 =====
function switchImageTab(btn, tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tabUrl').style.display = tab === 'url' ? '' : 'none';
  document.getElementById('tabFile').style.display = tab === 'file' ? '' : 'none';
}

// ===== 이미지 URL 미리보기 =====
function previewImage() {
  const url = document.getElementById('imageUrl').value.trim();
  const preview = document.getElementById('imagePreview');
  if (!url) {
    preview.innerHTML = '<span>이미지를 추가하면 미리보기가 표시됩니다</span>';
    return;
  }
  preview.innerHTML = `<img src="${url}" alt="미리보기"
    onerror="this.parentElement.innerHTML='<span>이미지를 불러올 수 없습니다</span>'" />`;
}

// ===== 파일 업로드 =====
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  document.getElementById('fileLabel').textContent = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    document.getElementById('imageUrl').value = dataUrl;
    document.getElementById('imagePreview').innerHTML =
      `<img src="${dataUrl}" alt="미리보기" />`;
  };
  reader.readAsDataURL(file);
}

// ===== 플레이버 태그 =====
function handleTagInput(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const input = document.getElementById('tagInput');
  const value = input.value.trim();
  if (value && !currentTags.includes(value)) {
    currentTags.push(value);
    renderTags();
  }
  input.value = '';
}

function renderTags() {
  document.getElementById('tagList').innerHTML = currentTags.map(t => `
    <span class="tag">${t}<span class="tag-remove" onclick="removeTag('${t}')">×</span></span>
  `).join('');
}

function removeTag(tag) {
  currentTags = currentTags.filter(t => t !== tag);
  renderTags();
}

// ===== 슬라이더 값 표시 =====
function updateSlider(input, valueId) {
  document.getElementById(valueId).textContent = input.value;
}

// ===== 폼 제출 =====
function handleSubmit(e) {
  e.preventDefault();
  const products = loadProducts();

  const product = {
    id: editingId || `product-${Date.now()}`,
    name: document.getElementById('productName').value.trim(),
    country: document.getElementById('country').value.trim(),
    area: document.getElementById('area').value.trim(),
    roast: document.getElementById('roast').value,
    process: document.getElementById('process').value.trim(),
    altitude: document.getElementById('altitude').value.trim(),
    badge: document.getElementById('badge').value || null,
    prices: {
      200:  parseInt(document.getElementById('price200').value),
      500:  parseInt(document.getElementById('price500').value),
      1000: parseInt(document.getElementById('price1000').value),
    },
    flavors: [...currentTags],
    flavorChart: {
      FLORAL:  parseInt(document.getElementById('sFloral').value),
      FRUITY:  parseInt(document.getElementById('sFruity').value),
      SWEET:   parseInt(document.getElementById('sSweet').value),
      ACIDITY: parseInt(document.getElementById('sAcidity').value),
      BODY:    parseInt(document.getElementById('sBody').value),
      ROAST:   parseInt(document.getElementById('sRoast').value),
    },
    description: document.getElementById('description').value.trim(),
    brewGuide: {
      temp:  document.getElementById('brewTemp').value.trim(),
      ratio: document.getElementById('brewRatio').value.trim(),
      time:  document.getElementById('brewTime').value.trim(),
      equip: document.getElementById('brewEquip').value.trim(),
    },
    image: document.getElementById('imageUrl').value.trim(),
    inStock: document.querySelector('input[name="stock"]:checked').value === 'true',
    createdAt: editingId
      ? (products.find(p => p.id === editingId)?.createdAt || new Date().toISOString())
      : new Date().toISOString(),
  };

  if (editingId) {
    const idx = products.findIndex(p => p.id === editingId);
    products[idx] = product;
    showToast('제품이 수정되었습니다');
  } else {
    products.push(product);
    showToast('제품이 등록되었습니다');
  }

  saveProducts(products);
  renderList();
  resetForm();
}

// ===== 수정 =====
function editProduct(id) {
  const p = loadProducts().find(prod => prod.id === id);
  if (!p) return;

  editingId = id;
  document.getElementById('formTitle').textContent = '제품 수정';
  document.getElementById('submitBtn').textContent = '수정 저장';
  document.getElementById('submitBtn').classList.add('editing');

  document.getElementById('imageUrl').value = p.image || '';
  previewImage();
  document.getElementById('description').value = p.description || '';
  document.getElementById('brewTemp').value  = p.brewGuide?.temp  || '';
  document.getElementById('brewRatio').value = p.brewGuide?.ratio || '';
  document.getElementById('brewTime').value  = p.brewGuide?.time  || '';
  document.getElementById('brewEquip').value = p.brewGuide?.equip || '';
  document.getElementById('productName').value = p.name;
  document.getElementById('country').value = p.country;
  document.getElementById('area').value = p.area;
  document.getElementById('roast').value = p.roast;
  document.getElementById('process').value = p.process || '';
  document.getElementById('altitude').value = p.altitude || '';
  document.getElementById('badge').value = p.badge || '';
  document.getElementById('price200').value = p.prices[200] || '';
  document.getElementById('price500').value = p.prices[500] || '';
  document.getElementById('price1000').value = p.prices[1000] || '';

  currentTags = [...(p.flavors || [])];
  renderTags();

  const chart = p.flavorChart || {};
  [
    ['sFloral', 'vFloral', 'FLORAL'],
    ['sFruity', 'vFruity', 'FRUITY'],
    ['sSweet',  'vSweet',  'SWEET'],
    ['sAcidity','vAcidity','ACIDITY'],
    ['sBody',   'vBody',   'BODY'],
    ['sRoast',  'vRoast',  'ROAST'],
  ].forEach(([sliderId, valId, key]) => {
    const val = chart[key] ?? 5;
    document.getElementById(sliderId).value = val;
    document.getElementById(valId).textContent = val;
  });

  document.querySelector(`input[name="stock"][value="${p.inStock !== false}"]`).checked = true;
  document.querySelector('.form-panel').scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== 삭제 =====
function deleteProduct(id) {
  if (!confirm('이 제품을 삭제하시겠습니까?')) return;
  saveProducts(loadProducts().filter(p => p.id !== id));
  renderList();
  showToast('제품이 삭제되었습니다');
  if (editingId === id) resetForm();
}

// ===== 초기화 =====
function resetForm() {
  editingId = null;
  document.getElementById('productForm').reset();
  document.getElementById('formTitle').textContent = '제품 등록';
  document.getElementById('submitBtn').textContent = '제품 등록';
  document.getElementById('submitBtn').classList.remove('editing');
  document.getElementById('imagePreview').innerHTML =
    '<span>이미지 URL을 입력하면 미리보기가 표시됩니다</span>';
  currentTags = [];
  renderTags();
  [
    ['sFloral','vFloral'], ['sFruity','vFruity'], ['sSweet','vSweet'],
    ['sAcidity','vAcidity'], ['sBody','vBody'], ['sRoast','vRoast'],
  ].forEach(([s, v]) => {
    document.getElementById(s).value = 5;
    document.getElementById(v).textContent = 5;
  });
}

// ===== 토스트 알림 =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// ===== 탭 전환 =====
const ALL_TABS = ['products', 'orders', 'members', 'subs', 'partners', 'settings'];
function switchAdminTab(tab) {
  ALL_TABS.forEach(t => {
    const panel = document.getElementById(t === 'products' ? 'productsPanel'
                : t === 'orders'   ? 'ordersPanel'
                : t === 'members'  ? 'membersPanel'
                : t === 'subs'     ? 'subsPanel'
                : t === 'partners' ? 'partnersPanel'
                : 'settingsPanel');
    const btn = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (panel) panel.style.display = t === tab ? '' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });
  if (tab === 'orders')   renderOrders('all');
  if (tab === 'members')  renderMembers();
  if (tab === 'subs')     renderSubs();
  if (tab === 'partners') renderPartners();
  if (tab === 'settings') renderAdminAccounts();
}

// ===== 주문 이력 =====
const ORDER_STATUSES = ['주문완료', '배송준비중', '배송중', '배송완료', '취소'];
const STATUS_COLORS  = {
  '주문완료':  '#B45309',
  '배송준비중':'#1D4ED8',
  '배송중':    '#6D28D9',
  '배송완료':  '#2D6A4F',
  '취소':      '#C0392B',
};

let currentOrderFilter = 'all';

function loadOrders() {
  return JSON.parse(localStorage.getItem('beans_orders') || '[]');
}

function renderOrders(filter) {
  currentOrderFilter = filter;
  const all    = loadOrders();
  const orders = filter === 'all' ? all : all.filter(o => o.status === filter);
  document.getElementById('ordersTotalCount').textContent = orders.length;

  const list = document.getElementById('orderList');
  if (orders.length === 0) {
    list.innerHTML = '<div class="empty-list">주문 내역이 없습니다.</div>';
    return;
  }

  list.innerHTML = orders.map(o => `
    <div class="order-card">
      <div class="order-card-top">
        <div class="order-meta">
          <span class="order-no">${o.orderNo}</span>
          <span class="order-date">${formatDate(o.createdAt)}</span>
        </div>
        <span class="order-status-badge" style="background:${STATUS_COLORS[o.status] || '#888'}">
          ${o.status}
        </span>
      </div>
      <div class="order-card-body">
        <div class="order-info-grid">
          <div class="order-info-item">
            <span class="order-info-label">상품</span>
            <span class="order-info-value">${o.product}</span>
          </div>
          <div class="order-info-item">
            <span class="order-info-label">결제 금액</span>
            <span class="order-info-value bold">${o.amount}</span>
          </div>
          <div class="order-info-item">
            <span class="order-info-label">결제 수단</span>
            <span class="order-info-value">${o.payment}</span>
          </div>
          <div class="order-info-item">
            <span class="order-info-label">수령인</span>
            <span class="order-info-value">${o.receiver} · ${o.phone}</span>
          </div>
          <div class="order-info-item full">
            <span class="order-info-label">배송지</span>
            <span class="order-info-value">${o.address}</span>
          </div>
          ${o.memo ? `
          <div class="order-info-item full">
            <span class="order-info-label">배송 메모</span>
            <span class="order-info-value">${o.memo}</span>
          </div>` : ''}
        </div>
      </div>
      <div class="order-card-foot">
        <span class="order-status-label">배송 상태 변경:</span>
        <div class="order-status-btns">
          ${ORDER_STATUSES.map(s => `
            <button class="status-btn ${o.status === s ? 'current' : ''}"
              onclick="updateOrderStatus('${o.orderNo}', '${s}')"
              ${o.status === s ? 'disabled' : ''}>
              ${s}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function filterOrders(btn, filter) {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOrders(filter);
}

function updateOrderStatus(orderNo, status) {
  const orders = loadOrders();
  const idx = orders.findIndex(o => o.orderNo === orderNo);
  if (idx === -1) return;
  orders[idx].status = status;
  localStorage.setItem('beans_orders', JSON.stringify(orders));
  renderOrders(currentOrderFilter);
  showToast(`${orderNo} 상태가 "${status}"로 변경되었습니다`);
}

function updateOrderBadge() {
  const count = loadOrders().filter(o => o.status === '주문완료').length;
  const badge = document.getElementById('orderBadge');
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ===== 회원 관리 =====
function loadMembers() {
  return JSON.parse(localStorage.getItem('beans_users') || '[]');
}

function updateMemberBadge() {
  const count = loadMembers().length;
  const badge = document.getElementById('memberBadge');
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
  document.getElementById('memberCount').textContent = count;
}

let selectedMemberEmail = null;

function renderMembers() {
  updateMemberBadge();
  const members = loadMembers();
  const orders  = loadOrders();
  const list    = document.getElementById('memberList');

  if (members.length === 0) {
    list.innerHTML = '<div class="empty-list">가입한 회원이 없습니다.</div>';
    return;
  }

  list.innerHTML = members.map(m => {
    const orderCount = orders.filter(o => o.email && o.email === m.email).length;
    const isSelected = m.email === selectedMemberEmail;
    return `
      <div class="member-row ${isSelected ? 'member-row--active' : ''}"
           onclick="selectMember('${m.email}')">
        <div class="member-avatar">${m.name.charAt(0)}</div>
        <div class="member-info">
          <p class="member-name">${m.name}</p>
          <p class="member-email">${m.email}</p>
          <p class="member-meta">가입일 ${formatDate(m.joinedAt)}</p>
        </div>
        <div class="member-order-count">
          <span class="member-order-num">${orderCount}</span>
          <span class="member-order-label">건</span>
        </div>
      </div>
    `;
  }).join('');
}

function selectMember(email) {
  selectedMemberEmail = email;
  renderMembers();

  const members = loadMembers();
  const member  = members.find(m => m.email === email);
  const orders  = loadOrders().filter(o => o.email === email);
  const panel   = document.getElementById('memberDetailPanel');

  if (!member) return;

  const orderHtml = orders.length === 0
    ? '<div class="empty-list" style="border:none;">이 회원의 주문 이력이 없습니다.</div>'
    : orders.map(o => `
        <div class="member-order-card">
          <div class="member-order-card-top">
            <div class="order-meta">
              <span class="order-no">${o.orderNo}</span>
              <span class="order-date">${formatDate(o.createdAt)}</span>
            </div>
            <span class="order-status-badge" style="background:${STATUS_COLORS[o.status] || '#888'}">
              ${o.status}
            </span>
          </div>
          <div class="member-order-card-body">
            <div class="order-info-grid">
              <div class="order-info-item">
                <span class="order-info-label">상품</span>
                <span class="order-info-value">${o.product}</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">결제 금액</span>
                <span class="order-info-value bold">${o.amount}</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">결제 수단</span>
                <span class="order-info-value">${o.payment}</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">배송지</span>
                <span class="order-info-value">${o.address}</span>
              </div>
            </div>
          </div>
        </div>
      `).join('');

  panel.innerHTML = `
    <div class="member-detail-header">
      <div class="member-detail-avatar">${member.name.charAt(0)}</div>
      <div>
        <p class="member-detail-name">${member.name}</p>
        <p class="member-detail-email">${member.email}</p>
        <p class="member-detail-joined">가입일 · ${formatDate(member.joinedAt)}</p>
      </div>
    </div>
    <div class="member-detail-orders-header">
      <p class="section-label" style="margin:0;">주문 이력 (${orders.length}건)</p>
    </div>
    <div class="member-detail-orders">
      ${orderHtml}
    </div>
  `;
}

// ===== 구독 신청 =====
function renderSubs() {
  const subs = JSON.parse(localStorage.getItem('beans_subscriptions') || '[]');
  document.getElementById('subsTotalCount').textContent = subs.length;
  const el = document.getElementById('subsList');
  if (subs.length === 0) { el.innerHTML = '<div class="empty-list">구독 신청 내역이 없습니다.</div>'; return; }
  el.innerHTML = subs.map((s, i) => `
    <div class="order-card">
      <div class="order-card-top">
        <div class="order-meta">
          <span class="order-no">${s.name} · ${s.email}</span>
          <span class="order-date">${formatDate(s.createdAt)}</span>
        </div>
        <span class="order-status-badge" style="background:#1D4ED8">${s.status || '신청완료'}</span>
      </div>
      <div class="order-card-body">
        <div class="order-info-grid">
          <div class="order-info-item"><span class="order-info-label">플랜</span><span class="order-info-value bold">${s.plan} · ${s.weight}</span></div>
          <div class="order-info-item"><span class="order-info-label">배송 주기</span><span class="order-info-value">월 ${s.frequency}회</span></div>
          <div class="order-info-item"><span class="order-info-label">분쇄 방식</span><span class="order-info-value">${s.grind}</span></div>
          <div class="order-info-item"><span class="order-info-label">연락처</span><span class="order-info-value">${s.phone}</span></div>
          ${s.taste ? `<div class="order-info-item full"><span class="order-info-label">취향 메모</span><span class="order-info-value">${s.taste}</span></div>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// ===== 파트너 상담 =====
function renderPartners() {
  const partners = JSON.parse(localStorage.getItem('beans_partners') || '[]');
  document.getElementById('partnersTotalCount').textContent = partners.length;
  const el = document.getElementById('partnersList');
  if (partners.length === 0) { el.innerHTML = '<div class="empty-list">파트너 상담 신청 내역이 없습니다.</div>'; return; }
  el.innerHTML = partners.map((p, i) => `
    <div class="order-card">
      <div class="order-card-top">
        <div class="order-meta">
          <span class="order-no">${p.store} · ${p.name}</span>
          <span class="order-date">${formatDate(p.createdAt)}</span>
        </div>
        <span class="order-status-badge" style="background:${p.status === '상담완료' ? '#2D6A4F' : '#B45309'}">${p.status || '상담대기'}</span>
      </div>
      <div class="order-card-body">
        <div class="order-info-grid">
          <div class="order-info-item"><span class="order-info-label">연락처</span><span class="order-info-value">${p.phone}</span></div>
          <div class="order-info-item"><span class="order-info-label">이메일</span><span class="order-info-value">${p.email || '—'}</span></div>
          <div class="order-info-item"><span class="order-info-label">매장 규모</span><span class="order-info-value">${p.scale || '—'}</span></div>
          <div class="order-info-item"><span class="order-info-label">상태</span>
            <select class="partner-status-select" onchange="updatePartnerStatus(${i}, this.value)">
              <option ${(p.status||'상담대기')==='상담대기' ? 'selected' : ''}>상담대기</option>
              <option ${p.status==='상담진행중' ? 'selected' : ''}>상담진행중</option>
              <option ${p.status==='상담완료' ? 'selected' : ''}>상담완료</option>
            </select>
          </div>
          ${p.message ? `<div class="order-info-item full"><span class="order-info-label">문의 내용</span><span class="order-info-value">${p.message}</span></div>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function updatePartnerStatus(idx, status) {
  const partners = JSON.parse(localStorage.getItem('beans_partners') || '[]');
  partners[idx].status = status;
  localStorage.setItem('beans_partners', JSON.stringify(partners));
  showToast(`상태가 "${status}"로 변경되었습니다`);
}

// ===== 초기화 =====
initAdminAccounts();
checkAdminAuth();
renderList();
updateOrderBadge();
updateMemberBadge();
