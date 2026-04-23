const STORAGE_KEY = 'beans_products';

// 기본 가격 (Ethiopia Yirgacheffe)
let prices = { 200: 18000, 500: 38000, 1000: 68000 };
let selectedWeight = 500;
let quantity = 1;

// 기본 플레이버 차트 데이터
const DEFAULT_CHART = {
  FLORAL: 9, FRUITY: 8, SWEET: 7, ACIDITY: 8, BODY: 4, ROAST: 2,
};

// ===== 메인 이미지 변경 =====
function changeImage(thumbEl, imageUrl) {
  document.getElementById('mainImage').src = imageUrl;
  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  thumbEl.classList.add('active');
}

// ===== 옵션 선택 =====
function selectOption(btn, group) {
  const parent = btn.closest('.option-buttons');
  parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  if (group === 'weight') {
    selectedWeight = parseInt(btn.dataset.value);
    updatePrice();
  }
}

// ===== 가격 업데이트 =====
function updatePrice() {
  const price = (prices[selectedWeight] || 0) * quantity;
  document.getElementById('productPrice').textContent = '₩' + price.toLocaleString('ko-KR');
}

// ===== 수량 변경 =====
function changeQty(delta) {
  quantity = Math.max(1, quantity + delta);
  document.getElementById('qtyValue').textContent = quantity;
  updatePrice();
}

// ===== 장바구니 =====
function addToCart() {
  const grind       = document.querySelector('#grindOptions .option-btn.selected')?.textContent || '홀빈';
  const productName = document.querySelector('.product-name')?.textContent || '';
  const productImg  = document.getElementById('mainImage')?.src || '';

  const cart     = JSON.parse(localStorage.getItem('beans_cart') || '[]');
  const existing = cart.find(i => i.name === productName && i.weight === selectedWeight && i.grind === grind);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      cartId:    'cart-' + Date.now(),
      name:      productName,
      image:     productImg,
      weight:    selectedWeight,
      grind,
      unitPrice: prices[selectedWeight] || 0,
      quantity,
    });
  }
  localStorage.setItem('beans_cart', JSON.stringify(cart));
  updateCartBadge();
  showCartAddedToast(productName);
}

function showCartAddedToast(name) {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'cart-toast';
    toast.innerHTML = `
      <span id="cartToastMsg"></span>
      <button class="cart-toast-link" onclick="window.location.href='cart.html'">장바구니 보기</button>
    `;
    document.body.appendChild(toast);
  }
  document.getElementById('cartToastMsg').textContent = `"${name}" 담겼습니다`;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== 바로 구매 =====
function buyNow() {
  const grind = document.querySelector('#grindOptions .option-btn.selected')?.textContent || '홀빈';
  sessionStorage.setItem('checkout_item', JSON.stringify({
    name:     document.querySelector('.product-name')?.textContent || '',
    image:    document.getElementById('mainImage')?.src || '',
    weight:   selectedWeight,
    grind:    grind,
    quantity: quantity,
    price:    (prices[selectedWeight] || 0) * quantity,
  }));
  window.location.href = 'checkout.html';
}

// ===== 레이더 차트 =====
function drawFlavorChart(chartData) {
  const data = chartData || DEFAULT_CHART;
  const svg = document.getElementById('flavorChart');
  svg.innerHTML = '';

  const cx = 150, cy = 150, maxR = 95, levels = 4;
  const ns = 'http://www.w3.org/2000/svg';
  const flavors = Object.entries(data).map(([label, value]) => ({ label, value }));
  const n = flavors.length;
  const step = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  function getPoint(i, r) {
    const angle = startAngle + i * step;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function el(tag, attrs) {
    const e = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }

  // 그리드 다각형
  for (let l = levels; l >= 1; l--) {
    const r = (maxR * l) / levels;
    const pts = Array.from({ length: n }, (_, i) => {
      const p = getPoint(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');
    svg.appendChild(el('polygon', {
      points: pts,
      fill: l % 2 === 0 ? '#F5F2EC' : 'none',
      stroke: '#E8E4DC',
      'stroke-width': '1',
    }));
  }

  // 축 선
  flavors.forEach((_, i) => {
    const p = getPoint(i, maxR);
    svg.appendChild(el('line', {
      x1: cx, y1: cy, x2: p.x, y2: p.y,
      stroke: '#E8E4DC', 'stroke-width': '1',
    }));
  });

  // 데이터 다각형
  const dataPts = flavors.map((f, i) => {
    const p = getPoint(i, (f.value / 10) * maxR);
    return `${p.x},${p.y}`;
  }).join(' ');
  svg.appendChild(el('polygon', {
    points: dataPts,
    fill: 'rgba(26,26,26,0.08)',
    stroke: '#1A1A1A',
    'stroke-width': '1.5',
    'stroke-linejoin': 'round',
  }));

  // 데이터 점
  flavors.forEach((f, i) => {
    const p = getPoint(i, (f.value / 10) * maxR);
    svg.appendChild(el('circle', { cx: p.x, cy: p.y, r: '3', fill: '#1A1A1A' }));
  });

  // 라벨
  flavors.forEach((f, i) => {
    const p = getPoint(i, maxR + 22);
    const text = el('text', {
      x: p.x, y: p.y,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': '9.5',
      'font-weight': '600',
      'letter-spacing': '0.06em',
      fill: '#6B6B6B',
      'font-family': 'Inter, -apple-system, sans-serif',
    });
    text.textContent = f.label;
    svg.appendChild(text);
  });
}

// ===== URL 파라미터로 제품 로드 =====
function loadProductFromUrl() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return;

  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  // localStorage에 없으면 기본 제품 목록에서 찾기
  const DEFAULT_PRODUCTS = [
    { id: 'default-1', name: 'Ethiopia Yirgacheffe', country: 'Ethiopia', area: 'Yirgacheffe',
      roast: 'light', process: 'Washed', altitude: '1,800–2,200m',
      prices: { 200: 18000, 500: 38000, 1000: 68000 },
      flavors: ['Jasmine', 'Bergamot', 'Lemon', 'Peach'],
      flavorChart: { FLORAL: 9, FRUITY: 8, SWEET: 7, ACIDITY: 8, BODY: 4, ROAST: 2 },
      image: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=700&q=80',
      description: '에티오피아 예르가체프 지역 소규모 농가에서 핸드픽한 원두입니다. 해발 2,000m 고지대의 서늘한 기후가 특유의 플로럴 향과 밝은 산미를 만들어냅니다. 워시드 공정으로 생두 본연의 깨끗한 개성을 그대로 담았습니다.',
      brewGuide: { temp: '90–93°C', ratio: '1:15', time: '3분', equip: '핸드드립·에어로프레스' },
      mapCoord: { lat: 6.15, lon: 38.20, span: 1.8 },
      inStock: true },
  ];
  const allProducts = [...stored, ...DEFAULT_PRODUCTS];
  const p = allProducts.find(prod => prod.id === id);
  if (!p) return;

  // 페이지 타이틀
  document.title = `${p.name} — 한국엘리스테이블`;

  // 상품 기본 정보
  document.querySelector('.product-region').textContent =
    `${p.country.toUpperCase()} · ${p.area.toUpperCase()}`;
  document.querySelector('.product-name').textContent = p.name;

  // 메타 정보
  const metaValues = document.querySelectorAll('.meta-value');
  if (metaValues[0]) metaValues[0].textContent = capitalize(p.roast);
  if (metaValues[1]) metaValues[1].textContent = p.process || '—';
  if (metaValues[2]) metaValues[2].textContent = p.altitude || '—';

  // 플레이버 태그
  document.querySelector('.flavor-tags').innerHTML =
    (p.flavors || []).map(f => `<span class="flavor-tag">${f}</span>`).join('');

  // 가격 업데이트
  prices = { ...p.prices };
  selectedWeight = 500;
  updatePrice();

  // 이미지
  document.getElementById('mainImage').src = p.image || '';

  // 재고 상태
  const stockEl = document.querySelector('.stock-status');
  if (p.inStock === false) {
    stockEl.textContent = '● 품절';
    stockEl.className = 'stock-status out-of-stock';
  } else {
    stockEl.textContent = '● 재고 있음';
    stockEl.className = 'stock-status in-stock';
  }

  // 플레이버 차트 재렌더링
  if (p.flavorChart) drawFlavorChart(p.flavorChart);

  // 스토리
  if (p.description) {
    document.getElementById('storyText').textContent = p.description;
  }

  // 추출 가이드
  if (p.brewGuide) {
    const g = p.brewGuide;
    if (g.temp)  document.getElementById('guideTemp').textContent  = g.temp;
    if (g.ratio) document.getElementById('guideRatio').textContent = g.ratio;
    if (g.time)  document.getElementById('guideTime').textContent  = g.time;
    if (g.equip) document.getElementById('guideEquip').textContent = g.equip;
  }

  // 원산지 지도
  const COUNTRY_KO = {
    Ethiopia: '에티오피아', Colombia: '콜롬비아', Kenya: '케냐',
    Guatemala: '과테말라', Panama: '파나마', Brazil: '브라질',
  };
  document.getElementById('originTitle').textContent =
    `${COUNTRY_KO[p.country] || p.country} · ${p.area}`;
  document.getElementById('originSub').textContent =
    [p.altitude && `해발 ${p.altitude}`, p.process].filter(Boolean).join(' · ');
  const mapSection = document.getElementById('originMapSection');
  if (p.mapCoord) {
    const s = p.mapCoord.span || 1.5;
    const { lat, lon } = p.mapCoord;
    document.getElementById('originMapIframe').src =
      `https://www.openstreetmap.org/export/embed.html?bbox=${lon - s},${lat - s},${lon + s},${lat + s}&layer=mapnik&marker=${lat},${lon}`;
    mapSection.style.display = '';
  } else {
    mapSection.style.display = 'none';
  }
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// ===== 초기화 =====
updatePrice();
drawFlavorChart();
loadProductFromUrl();
