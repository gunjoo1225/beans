const PAYMENT_LABELS = {
  card:  '신용·체크카드',
  bank:  '무통장입금',
  kakao: '카카오페이',
  toss:  '토스페이',
};

const SHIPPING_FEE = 3000;
const FREE_SHIPPING_THRESHOLD = 50000;

// ===== 로그인 정보 자동 입력 =====
function prefillFromSession() {
  const session = getSession();
  if (!session) return;

  const nameEl  = document.getElementById('receiverName');
  const emailEl = document.getElementById('receiverEmail');

  if (nameEl  && !nameEl.value)  nameEl.value  = session.name;
  if (emailEl && !emailEl.value) emailEl.value = session.email;

  // 안내 배너 삽입 (이미 있으면 skip)
  if (document.getElementById('loginPrefillNotice')) return;
  const block = document.querySelector('.form-block');
  if (!block) return;
  const notice = document.createElement('p');
  notice.id = 'loginPrefillNotice';
  notice.style.cssText = 'font-size:13px;color:#2D6A4F;margin:0 0 16px;padding:10px 14px;background:#F0FAF4;border-left:3px solid #2D6A4F;';
  notice.textContent = `${session.name}님의 로그인 정보로 자동 입력되었습니다.`;
  block.insertBefore(notice, block.firstChild);
}

// ===== 주문서 페이지 초기화 =====
function initCheckout() {
  // 장바구니(복수) 또는 바로구매(단일) 모두 처리
  const cartItems  = JSON.parse(sessionStorage.getItem('checkout_cart') || 'null');
  const singleItem = JSON.parse(sessionStorage.getItem('checkout_item') || 'null');
  const items      = cartItems || (singleItem ? [singleItem] : []);

  if (items.length === 0) return;
  window._checkoutItems = items;

  // 주문 상품 렌더링
  const orderItemEl = document.getElementById('orderItem');
  orderItemEl.innerHTML = items.map(item => `
    <div style="display:flex;gap:14px;padding:10px 0;border-bottom:1px solid #F5F2EC">
      <div style="width:64px;height:64px;background:#F0EDE6;flex-shrink:0;overflow:hidden">
        <img src="${item.image || ''}" style="width:100%;height:100%;object-fit:cover"
          onerror="this.style.visibility='hidden'" />
      </div>
      <div style="display:flex;flex-direction:column;gap:3px">
        <p style="font-size:14px;font-weight:600">${item.name}</p>
        <p style="font-size:12px;color:#6B6B6B">${item.weight}g · ${item.grind} · ${item.quantity}개</p>
        <p style="font-size:14px;font-weight:500">₩${item.price.toLocaleString('ko-KR')}</p>
      </div>
    </div>
  `).join('');

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total    = subtotal + shipping;

  document.getElementById('summarySubtotal').textContent =
    '₩' + subtotal.toLocaleString('ko-KR');
  document.getElementById('summaryShipping').textContent =
    shipping === 0 ? '무료' : '₩' + shipping.toLocaleString('ko-KR');
  document.getElementById('summaryTotal').textContent =
    '₩' + total.toLocaleString('ko-KR');

  const notice = document.getElementById('shippingNotice');
  notice.textContent = shipping > 0
    ? `₩${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('ko-KR')} 더 담으면 무료배송!`
    : '✓ 무료배송 적용';

  // 결제 수단 변경 감지
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('bankInfo').style.display =
        radio.value === 'bank' ? 'block' : 'none';
    });
  });

  // 배송 메모 직접 입력
  document.getElementById('deliveryMemo').addEventListener('change', function () {
    document.getElementById('deliveryMemoText').style.display =
      this.value === 'direct' ? 'block' : 'none';
  });

  prefillFromSession();
}

// ===== 주소 검색 (Daum Postcode) =====
function searchAddress() {
  function openPostcode() {
    new daum.Postcode({
      oncomplete: function (data) {
        document.getElementById('postcode').value = data.zonecode;
        document.getElementById('address').value =
          data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        document.getElementById('addressDetail').focus();
      },
    }).open();
  }
  if (window.daum && window.daum.Postcode) {
    openPostcode();
  } else {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = openPostcode;
    document.head.appendChild(script);
  }
}

// ===== 전체 약관 동의 =====
function toggleAllTerms(checkbox) {
  document.querySelectorAll('.term-check').forEach(c => {
    c.checked = checkbox.checked;
  });
}

// ===== 결제하기 =====
function submitOrder() {
  const name    = document.getElementById('receiverName').value.trim();
  const phone   = document.getElementById('receiverPhone').value.trim();
  const email   = document.getElementById('receiverEmail').value.trim();
  const address = document.getElementById('address').value.trim();
  const detail  = document.getElementById('addressDetail').value.trim();

  if (!name || !phone || !address || !detail) {
    alert('배송 정보를 모두 입력해주세요.');
    return;
  }

  const requiredTerms = document.querySelectorAll('.term-check[required]');
  for (const term of requiredTerms) {
    if (!term.checked) {
      alert('필수 약관에 동의해주세요.');
      return;
    }
  }

  const payment  = document.querySelector('input[name="payment"]:checked').value;
  const memo     = document.getElementById('deliveryMemo').value === 'direct'
    ? document.getElementById('deliveryMemoText').value.trim()
    : document.getElementById('deliveryMemo').value;
  const items    = window._checkoutItems || [];
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total    = subtotal + shipping;

  const order = {
    orderNo:   'ORD-' + Date.now().toString().slice(-8),
    product:   items.length === 1
      ? `${items[0].name} ${items[0].weight}g (${items[0].grind}) × ${items[0].quantity}`
      : `${items[0].name} 외 ${items.length - 1}건`,
    subtotal,
    shipping,
    total,
    amount:    '₩' + total.toLocaleString('ko-KR'),
    payment:   PAYMENT_LABELS[payment] || payment,
    receiver:  name,
    phone,
    email:     email || '',
    address:   `${address} ${detail}`,
    memo:      memo || '',
    status:    '주문완료',
    createdAt: new Date().toISOString(),
  };

  // localStorage에 누적 저장 (관리자 페이지에서 확인)
  const orders = JSON.parse(localStorage.getItem('beans_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('beans_orders', JSON.stringify(orders));

  // 주문 완료 후 장바구니 비우기
  localStorage.removeItem('beans_cart');
  sessionStorage.removeItem('checkout_cart');
  sessionStorage.removeItem('checkout_item');

  sessionStorage.setItem('order_complete', JSON.stringify(order));
  window.location.href = 'order-complete.html';
}

// ===== 주문 완료 페이지 초기화 =====
function initOrderComplete() {
  const order = JSON.parse(sessionStorage.getItem('order_complete') || 'null');
  if (!order) return;

  document.getElementById('completeOrderNo').textContent  = order.orderNo;
  document.getElementById('completeProduct').textContent  = order.product;
  document.getElementById('completeAmount').textContent   = order.amount;
  document.getElementById('completePayment').textContent  = order.payment;
  document.getElementById('completeAddress').textContent  = order.address;

  sessionStorage.removeItem('order_complete');
}

// ===== 페이지 판별 후 실행 =====
if (document.getElementById('orderItem')) {
  initCheckout();
} else if (document.getElementById('completeOrderNo')) {
  initOrderComplete();
}
