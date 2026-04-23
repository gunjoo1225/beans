const PAYMENT_LABELS = {
  card:  '신용·체크카드',
  bank:  '무통장입금',
  kakao: '카카오페이',
  toss:  '토스페이',
};

const SHIPPING_FEE = 3000;
const FREE_SHIPPING_THRESHOLD = 50000;

// ===== 주문서 페이지 초기화 =====
function initCheckout() {
  const data = JSON.parse(sessionStorage.getItem('checkout_item') || 'null');

  if (data) {
    document.getElementById('summaryImage').src = data.image || '';
    document.getElementById('summaryName').textContent = data.name;
    document.getElementById('summaryOptions').textContent =
      `${data.weight}g · ${data.grind} · ${data.quantity}개`;

    const subtotal = data.price;
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    document.getElementById('summaryItemPrice').textContent =
      '₩' + subtotal.toLocaleString('ko-KR');
    document.getElementById('summarySubtotal').textContent =
      '₩' + subtotal.toLocaleString('ko-KR');
    document.getElementById('summaryShipping').textContent =
      shipping === 0 ? '무료' : '₩' + shipping.toLocaleString('ko-KR');
    document.getElementById('summaryTotal').textContent =
      '₩' + total.toLocaleString('ko-KR');

    const notice = document.getElementById('shippingNotice');
    if (shipping > 0) {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      notice.textContent = `₩${remaining.toLocaleString('ko-KR')} 더 담으면 무료배송!`;
    } else {
      notice.textContent = '✓ 무료배송 적용';
    }
  }

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
}

// ===== 주소 검색 (Daum Postcode) =====
function searchAddress() {
  new daum.Postcode({
    oncomplete: function (data) {
      document.getElementById('postcode').value = data.zonecode;
      document.getElementById('address').value =
        data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      document.getElementById('addressDetail').focus();
    },
  }).open();
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
  const data     = JSON.parse(sessionStorage.getItem('checkout_item') || '{}');
  const subtotal = data.price || 0;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total    = subtotal + shipping;

  const order = {
    orderNo:   'ORD-' + Date.now().toString().slice(-8),
    product:   `${data.name} ${data.weight}g (${data.grind}) × ${data.quantity}`,
    subtotal,
    shipping,
    total,
    amount:    '₩' + total.toLocaleString('ko-KR'),
    payment:   PAYMENT_LABELS[payment] || payment,
    receiver:  name,
    phone,
    address:   `${address} ${detail}`,
    memo:      memo || '',
    status:    '주문완료',
    createdAt: new Date().toISOString(),
  };

  // localStorage에 누적 저장 (관리자 페이지에서 확인)
  const orders = JSON.parse(localStorage.getItem('beans_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('beans_orders', JSON.stringify(orders));

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
