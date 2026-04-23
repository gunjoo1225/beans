const CART_KEY = 'beans_cart';
const SHIPPING_FEE = 3000;
const FREE_SHIPPING_THRESHOLD = 50000;

// ===== 공통 유틸 (모든 페이지에서 사용) =====

function loadCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartBadge() {
  const total = loadCart().reduce((sum, item) => sum + item.quantity, 0);
  const el = document.getElementById('cartBadge');
  if (el) el.textContent = `Cart (${total})`;
}

function calcSummary(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping  = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { subtotal, shipping, total: subtotal + shipping };
}

// ===== 장바구니 페이지 렌더링 =====

function renderCart() {
  const cart   = loadCart();
  const layout = document.getElementById('cartLayout');
  const empty  = document.getElementById('cartEmpty');
  if (!layout) return;

  if (cart.length === 0) {
    layout.style.display = 'none';
    empty.style.display  = '';
    return;
  }

  layout.style.display = '';
  empty.style.display  = 'none';

  document.getElementById('cartList').innerHTML = cart.map(item => `
    <div class="cart-item" id="item-${item.cartId}">
      <img class="cart-item-img"
        src="${item.image || ''}"
        alt="${item.name}"
        onerror="this.style.visibility='hidden'" />
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-options">${item.weight}g · ${item.grind}</p>
        <div class="cart-item-bottom">
          <div class="cart-qty">
            <button class="cart-qty-btn" onclick="changeQty('${item.cartId}', -1)">−</button>
            <span class="cart-qty-value" id="qty-${item.cartId}">${item.quantity}</span>
            <button class="cart-qty-btn" onclick="changeQty('${item.cartId}', 1)">+</button>
          </div>
          <span class="cart-item-price" id="price-${item.cartId}">
            ₩${(item.unitPrice * item.quantity).toLocaleString('ko-KR')}
          </span>
          <button class="btn-remove-item" onclick="removeItem('${item.cartId}')" title="삭제">×</button>
        </div>
      </div>
    </div>
  `).join('');

  updateSummaryPanel(cart);
  updateCartBadge();
}

function updateSummaryPanel(cart) {
  const { subtotal, shipping, total } = calcSummary(cart);

  document.getElementById('cartSubtotal').textContent =
    '₩' + subtotal.toLocaleString('ko-KR');
  document.getElementById('cartShipping').textContent =
    shipping === 0 ? '무료' : '₩' + shipping.toLocaleString('ko-KR');
  document.getElementById('cartTotal').textContent =
    '₩' + total.toLocaleString('ko-KR');

  const notice = document.getElementById('cartShippingNotice');
  if (shipping > 0) {
    const need = FREE_SHIPPING_THRESHOLD - subtotal;
    notice.textContent = `₩${need.toLocaleString('ko-KR')} 더 담으면 무료배송!`;
  } else {
    notice.textContent = subtotal > 0 ? '✓ 무료배송 적용' : '';
  }
}

// ===== 수량 변경 =====
function changeQty(cartId, delta) {
  const cart = loadCart();
  const item = cart.find(i => i.cartId === cartId);
  if (!item) return;

  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);

  document.getElementById(`qty-${cartId}`).textContent = item.quantity;
  document.getElementById(`price-${cartId}`).textContent =
    '₩' + (item.unitPrice * item.quantity).toLocaleString('ko-KR');
  updateSummaryPanel(cart);
  updateCartBadge();
}

// ===== 아이템 삭제 =====
function removeItem(cartId) {
  saveCart(loadCart().filter(i => i.cartId !== cartId));
  renderCart();
}

// ===== 전체 삭제 =====
function clearCart() {
  if (!confirm('장바구니를 비우시겠습니까?')) return;
  saveCart([]);
  renderCart();
}

// ===== 주문하기 (checkout으로 이동) =====
function proceedToCheckout() {
  const cart = loadCart();
  if (cart.length === 0) return;

  // checkout_cart 형태로 변환
  const checkoutItems = cart.map(item => ({
    name:     item.name,
    image:    item.image,
    weight:   item.weight,
    grind:    item.grind,
    quantity: item.quantity,
    price:    item.unitPrice * item.quantity,
  }));

  sessionStorage.setItem('checkout_cart', JSON.stringify(checkoutItems));
  sessionStorage.removeItem('checkout_item');
  window.location.href = 'checkout.html';
}

// ===== 페이지 진입 시 실행 =====
if (document.getElementById('cartList')) {
  renderCart();
} else {
  updateCartBadge();
}
