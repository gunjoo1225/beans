const STORAGE_KEY = 'beans_products';

// admin에서 등록한 제품이 없을 때 보여줄 기본 제품
const DEFAULT_PRODUCTS = [
  {
    id: 'default-1',
    name: 'Ethiopia Yirgacheffe',
    country: 'Ethiopia',
    area: 'Yirgacheffe',
    roast: 'light',
    process: 'Washed',
    altitude: '1,800–2,200m',
    prices: { 200: 18000, 500: 38000, 1000: 68000 },
    flavors: ['Jasmine', 'Bergamot', 'Lemon'],
    flavorChart: { FLORAL: 9, FRUITY: 8, SWEET: 7, ACIDITY: 8, BODY: 4, ROAST: 2 },
    image: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=600&q=80',
    badge: 'New',
    description: '에티오피아 예르가체프 지역 소규모 농가에서 핸드픽한 원두입니다. 해발 2,000m 고지대의 서늘한 기후가 특유의 플로럴 향과 밝은 산미를 만들어냅니다. 워시드 공정으로 생두 본연의 깨끗한 개성을 그대로 담았습니다.',
    brewGuide: { temp: '90–93°C', ratio: '1:15', time: '3분', equip: '핸드드립·에어로프레스' },
    mapCoord: { lat: 6.15, lon: 38.20, span: 1.8 },
    inStock: true,
  },
  {
    id: 'default-2',
    name: 'Colombia Huila',
    country: 'Colombia',
    area: 'Huila',
    roast: 'medium',
    process: 'Washed',
    altitude: '1,500–1,900m',
    prices: { 200: 16000, 500: 34000, 1000: 60000 },
    flavors: ['Caramel', 'Red Apple', 'Hazelnut'],
    flavorChart: { FLORAL: 4, FRUITY: 6, SWEET: 8, ACIDITY: 6, BODY: 7, ROAST: 5 },
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80',
    badge: null,
    description: '콜롬비아 우일라 지역은 안데스 산맥의 풍부한 화산 토양이 원두에 달콤한 캐러멜 뉘앙스를 더해줍니다. 중배전으로 산미와 단맛의 균형을 잡아 핸드드립부터 모카포트까지 어떤 추출 방식에도 잘 어울립니다.',
    brewGuide: { temp: '88–91°C', ratio: '1:15', time: '3분 30초', equip: '드립·모카포트' },
    mapCoord: { lat: 1.89, lon: -75.99, span: 1.5 },
    inStock: true,
  },
  {
    id: 'default-3',
    name: 'Kenya AA',
    country: 'Kenya',
    area: 'AA',
    roast: 'light',
    process: 'Washed',
    altitude: '1,400–2,000m',
    prices: { 200: 20000, 500: 42000, 1000: 76000 },
    flavors: ['Blackcurrant', 'Grapefruit', 'Brown Sugar'],
    flavorChart: { FLORAL: 5, FRUITY: 9, SWEET: 6, ACIDITY: 9, BODY: 5, ROAST: 2 },
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    badge: null,
    description: '케냐 AA 등급은 케냐에서 가장 큰 스크린 사이즈의 원두로, 케냐 특유의 워시드 공정으로 정제됩니다. 블랙커런트의 강렬한 과실향과 자몽의 상큼한 산미가 인상적이며, 식을수록 더 풍부한 향미가 살아납니다.',
    brewGuide: { temp: '92–94°C', ratio: '1:16', time: '3분', equip: '핸드드립·케멕스' },
    mapCoord: { lat: -0.30, lon: 36.82, span: 1.8 },
    inStock: true,
  },
  {
    id: 'default-4',
    name: 'Guatemala Antigua',
    country: 'Guatemala',
    area: 'Antigua',
    roast: 'medium',
    process: 'Washed',
    altitude: '1,500–1,700m',
    prices: { 200: 15000, 500: 32000, 1000: 56000 },
    flavors: ['Chocolate', 'Almond', 'Orange Zest'],
    flavorChart: { FLORAL: 3, FRUITY: 5, SWEET: 7, ACIDITY: 5, BODY: 8, ROAST: 6 },
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    badge: null,
    description: '과테말라 안티과는 아구아·푸에고·아카테낭고 세 화산에 둘러싸인 분지 지형으로 독특한 미기후를 형성합니다. 초콜릿과 아몬드의 묵직한 뒷맛에 오렌지 껍질 같은 시트러스 향이 은은하게 어우러집니다.',
    brewGuide: { temp: '88–90°C', ratio: '1:14', time: '4분', equip: '프렌치프레스·드립' },
    mapCoord: { lat: 14.56, lon: -90.73, span: 0.8 },
    inStock: true,
  },
  {
    id: 'default-5',
    name: 'Panama Geisha',
    country: 'Panama',
    area: 'Boquete',
    roast: 'light',
    process: 'Natural',
    altitude: '1,600–1,900m',
    prices: { 200: 45000, 500: 98000, 1000: 180000 },
    flavors: ['Peach', 'Jasmine', 'Tropical Fruit'],
    flavorChart: { FLORAL: 10, FRUITY: 9, SWEET: 8, ACIDITY: 7, BODY: 4, ROAST: 1 },
    image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600&q=80',
    badge: 'Premium',
    description: '파나마 보케테 에스메랄다 농장에서 생산되는 게이샤 품종은 세계 최고가 원두 중 하나입니다. 복숭아·자스민·열대과일이 복잡하게 어우러지는 향미는 한 번 경험하면 잊기 어려운 특별한 커피 경험을 선사합니다.',
    brewGuide: { temp: '90–92°C', ratio: '1:16', time: '3분', equip: '핸드드립·에어로프레스' },
    mapCoord: { lat: 8.78, lon: -82.44, span: 0.6 },
    inStock: true,
  },
  {
    id: 'default-6',
    name: 'Brazil Santos',
    country: 'Brazil',
    area: 'Santos',
    roast: 'dark',
    process: 'Natural',
    altitude: '900–1,200m',
    prices: { 200: 13000, 500: 28000, 1000: 50000 },
    flavors: ['Dark Chocolate', 'Walnut', 'Caramel'],
    flavorChart: { FLORAL: 2, FRUITY: 3, SWEET: 7, ACIDITY: 3, BODY: 9, ROAST: 8 },
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80',
    badge: null,
    description: '브라질 산토스는 세계 최대 커피 생산지 브라질의 대표 원두입니다. 내추럴 공정으로 건조해 다크초콜릿과 호두의 고소하고 묵직한 풍미가 살아있으며, 에스프레소 블렌딩 베이스로도 인기가 높습니다.',
    brewGuide: { temp: '86–88°C', ratio: '1:13', time: '25초', equip: '에스프레소·모카포트' },
    mapCoord: { lat: -23.95, lon: -46.33, span: 1.2 },
    inStock: true,
  },
];

function seedDefaultsIfNeeded() {
  if (localStorage.getItem('beans_seeded_v3')) return;
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const defaultIds = DEFAULT_PRODUCTS.map(p => p.id);
  const customProducts = stored.filter(p => !defaultIds.includes(p.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...DEFAULT_PRODUCTS, ...customProducts]));
  localStorage.setItem('beans_seeded_v3', 'true');
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
    <a href="product.html?id=${p.id}" class="product-card" data-roast="${p.roast}">
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
