const STORAGE_KEY = 'beans_products';
let currentTags = [];
let editingId = null;

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
function switchAdminTab(tab) {
  document.getElementById('productsPanel').style.display = tab === 'products' ? '' : 'none';
  document.getElementById('ordersPanel').style.display   = tab === 'orders'   ? '' : 'none';
  document.getElementById('tabProducts').classList.toggle('active', tab === 'products');
  document.getElementById('tabOrders').classList.toggle('active', tab === 'orders');
  if (tab === 'orders') renderOrders('all');
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

// ===== 초기화 =====
renderList();
updateOrderBadge();
