const STORAGE_KEY = 'beans_products';

// admin에서 등록한 제품이 없을 때 보여줄 기본 제품
const DEFAULT_PRODUCTS = [
  {
    id: 'default-1',
    name: 'Ethiopia Yirgacheffe',
    country: 'Ethiopia',
    area: 'Yirgacheffe',
    roast: 'light',
    prices: { 200: 18000, 500: 38000, 1000: 68000 },
    flavors: ['Jasmine', 'Bergamot', 'Lemon'],
    image: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=600&q=80',
    badge: 'New',
  },
  {
    id: 'default-2',
    name: 'Colombia Huila',
    country: 'Colombia',
    area: 'Huila',
    roast: 'medium',
    prices: { 200: 16000, 500: 34000, 1000: 60000 },
    flavors: ['Caramel', 'Red Apple', 'Hazelnut'],
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80',
    badge: null,
  },
  {
    id: 'default-3',
    name: 'Kenya AA',
    country: 'Kenya',
    area: 'AA',
    roast: 'light',
    prices: { 200: 20000, 500: 42000, 1000: 76000 },
    flavors: ['Blackcurrant', 'Grapefruit', 'Brown Sugar'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    badge: null,
  },
  {
    id: 'default-4',
    name: 'Guatemala Antigua',
    country: 'Guatemala',
    area: 'Antigua',
    roast: 'medium',
    prices: { 200: 15000, 500: 32000, 1000: 56000 },
    flavors: ['Chocolate', 'Almond', 'Orange Zest'],
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    badge: null,
  },
  {
    id: 'default-5',
    name: 'Panama Geisha',
    country: 'Panama',
    area: 'Boquete',
    roast: 'light',
    prices: { 200: 45000, 500: 98000, 1000: 180000 },
    flavors: ['Peach', 'Jasmine', 'Tropical Fruit'],
    image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600&q=80',
    badge: 'Premium',
  },
  {
    id: 'default-6',
    name: 'Brazil Santos',
    country: 'Brazil',
    area: 'Santos',
    roast: 'dark',
    prices: { 200: 13000, 500: 28000, 1000: 50000 },
    flavors: ['Dark Chocolate', 'Walnut', 'Caramel'],
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80',
    badge: null,
  },
];

function seedDefaultsIfNeeded() {
  if (localStorage.getItem('beans_seeded')) return;
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  // 기존 등록 제품은 유지하면서 기본 제품을 앞에 추가
  const merged = [...DEFAULT_PRODUCTS, ...stored];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  localStorage.setItem('beans_seeded', 'true');
}

function getProducts() {
  seedDefaultsIfNeeded();
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function renderProducts(products) {
  const grid = document.getElementById('shopGrid');
  if (products.length === 0) {
    grid.innerHTML = '<p style="padding:60px;color:#6B6B6B;text-align:center;grid-column:1/-1">표시할 제품이 없습니다.</p>';
    return;
  }
  grid.innerHTML = products.map(p => `
    <a href="index.html?id=${p.id}" class="product-card" data-roast="${p.roast}">
      <div class="card-image">
        <img src="${p.image || ''}" alt="${p.name}"
          onerror="this.style.visibility='hidden'" />
        ${p.badge ? `<div class="card-badge">${p.badge}</div>` : ''}
      </div>
      <div class="card-info">
        <p class="card-region">${p.country.toUpperCase()} · ${p.area.toUpperCase()}</p>
        <h2 class="card-name">${p.name}</h2>
        <p class="card-notes">${(p.flavors || []).join(' · ')}</p>
        <div class="card-bottom">
          <span class="card-roast">${capitalize(p.roast)}</span>
          <span class="card-price">₩${Number(p.prices[200]).toLocaleString('ko-KR')}~</span>
        </div>
      </div>
    </a>
  `).join('');
}

function filterProducts(btn, roast) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.product-card').forEach(card => {
    card.classList.toggle('hidden', roast !== 'all' && card.dataset.roast !== roast);
  });
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// 초기 렌더링
renderProducts(getProducts());
