// ===== 공통 인증 모듈 — 모든 페이지에 포함 =====

// ----- 세션 -----
function getSession() {
  return JSON.parse(sessionStorage.getItem('beans_session') || 'null');
}
function setSession(user) {
  sessionStorage.setItem('beans_session', JSON.stringify(user));
}
function clearSession() {
  sessionStorage.removeItem('beans_session');
}

// ----- 헤더 업데이트 -----
function updateHeaderAuth() {
  const area = document.getElementById('headerAuthArea');
  if (!area) return;
  const session = getSession();
  const count = JSON.parse(localStorage.getItem('beans_cart') || '[]').reduce((s, i) => s + i.quantity, 0);
  if (session) {
    area.innerHTML = `
      <a href="mypage.html" class="auth-user-btn">${session.name}님</a>
      <button class="auth-btn auth-btn--ghost" onclick="authLogout()">로그아웃</button>
      <a href="cart.html" class="cart-icon" id="cartBadge">Cart (${count})</a>
    `;
  } else {
    area.innerHTML = `
      <button class="auth-btn auth-btn--ghost" onclick="openLoginModal()">로그인</button>
      <button class="auth-btn" onclick="openSignupModal()">회원가입</button>
      <a href="cart.html" class="cart-icon" id="cartBadge">Cart (${count})</a>
    `;
  }
}

// ----- 로그아웃 -----
function authLogout() {
  clearSession();
  updateHeaderAuth();
  showAuthToast('로그아웃 되었습니다.');
}

// ----- 모달 HTML 주입 -----
function injectAuthModals() {
  if (document.getElementById('authModals')) return;
  const wrap = document.createElement('div');
  wrap.id = 'authModals';
  wrap.innerHTML = `
    <!-- 로그인 모달 -->
    <div class="modal-overlay" id="loginModal" onclick="closeLoginModal(event)">
      <div class="modal-container">
        <button class="modal-close" onclick="closeLoginModal()">×</button>
        <h2 class="modal-title">로그인</h2>
        <p class="modal-sub">한국엘리스테이블에 오신 것을 환영합니다</p>
        <form class="signup-form" id="loginForm" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label class="form-label" for="loginEmail">이메일</label>
            <input class="form-input" type="email" id="loginEmail" placeholder="example@email.com" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="loginPassword">비밀번호</label>
            <input class="form-input" type="password" id="loginPassword" placeholder="비밀번호 입력" required />
          </div>
          <p class="form-error" id="loginError"></p>
          <button class="btn-signup-submit" type="submit">로그인</button>
        </form>
        <p class="modal-footer-text">아직 회원이 아니신가요? <button class="link-btn" onclick="switchToSignup()">회원가입</button></p>
      </div>
    </div>

    <!-- 회원가입 모달 -->
    <div class="modal-overlay" id="signupModal" onclick="closeSignupModal(event)">
      <div class="modal-container">
        <button class="modal-close" onclick="closeSignupModal()">×</button>
        <h2 class="modal-title">회원가입</h2>
        <p class="modal-sub">한국엘리스테이블 회원이 되어보세요</p>
        <form class="signup-form" id="signupForm" onsubmit="handleSignup(event)">
          <div class="form-group">
            <label class="form-label" for="signupName">이름</label>
            <input class="form-input" type="text" id="signupName" placeholder="홍길동" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="signupEmail">이메일</label>
            <input class="form-input" type="email" id="signupEmail" placeholder="example@email.com" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="signupPassword">비밀번호</label>
            <input class="form-input" type="password" id="signupPassword" placeholder="8자 이상 입력" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="signupPasswordConfirm">비밀번호 확인</label>
            <input class="form-input" type="password" id="signupPasswordConfirm" placeholder="비밀번호 재입력" required />
          </div>
          <p class="form-error" id="signupError"></p>
          <button class="btn-signup-submit" type="submit">가입하기</button>
        </form>
        <p class="modal-footer-text">이미 회원이신가요? <button class="link-btn" onclick="switchToLogin()">로그인</button></p>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
}

// ----- 로그인 -----
function openLoginModal() {
  document.getElementById('loginModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLoginModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('loginModal').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('loginError').textContent = '';
}
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pw    = document.getElementById('loginPassword').value;
  const err   = document.getElementById('loginError');
  const users = JSON.parse(localStorage.getItem('beans_users') || '[]');
  const user  = users.find(u => u.email === email && u.password === pw);
  if (!user) { err.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.'; return; }
  setSession({ name: user.name, email: user.email });
  document.getElementById('loginForm').reset();
  closeLoginModal();
  updateHeaderAuth();
  showAuthToast(`${user.name}님, 환영합니다!`);
}

// ----- 회원가입 -----
function openSignupModal() {
  document.getElementById('signupModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSignupModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('signupModal').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('signupError').textContent = '';
}
function handleSignup(e) {
  e.preventDefault();
  const name   = document.getElementById('signupName').value.trim();
  const email  = document.getElementById('signupEmail').value.trim();
  const pw     = document.getElementById('signupPassword').value;
  const pwConf = document.getElementById('signupPasswordConfirm').value;
  const err    = document.getElementById('signupError');
  err.style.color = '#C0392B';
  if (pw.length < 8) { err.textContent = '비밀번호는 8자 이상이어야 합니다.'; return; }
  if (pw !== pwConf) { err.textContent = '비밀번호가 일치하지 않습니다.'; return; }
  const users = JSON.parse(localStorage.getItem('beans_users') || '[]');
  if (users.find(u => u.email === email)) { err.textContent = '이미 사용 중인 이메일입니다.'; return; }
  users.push({ name, email, password: pw, joinedAt: new Date().toISOString() });
  localStorage.setItem('beans_users', JSON.stringify(users));
  err.style.color = '#2D6A4F';
  err.textContent = '회원가입이 완료되었습니다!';
  document.getElementById('signupForm').reset();
  setTimeout(() => {
    closeSignupModal();
    err.textContent = '';
    setSession({ name, email });
    updateHeaderAuth();
    showAuthToast(`${name}님, 환영합니다!`);
  }, 1400);
}

// ----- 모달 전환 -----
function switchToSignup() { closeLoginModal(); setTimeout(openSignupModal, 180); }
function switchToLogin()  { closeSignupModal(); setTimeout(openLoginModal, 180); }

// ----- 토스트 -----
function showAuthToast(msg) {
  let t = document.getElementById('authToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'authToast';
    t.style.cssText = `
      position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(12px);
      background:#1A1A1A;color:#FAF8F4;padding:12px 24px;font-size:13px;
      font-family:inherit;opacity:0;visibility:hidden;
      transition:opacity .3s,transform .3s,visibility .3s;z-index:600;white-space:nowrap;
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1'; t.style.visibility = 'visible'; t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = '0'; t.style.visibility = 'hidden'; t.style.transform = 'translateX(-50%) translateY(12px)';
  }, 2500);
}

// ----- ESC 키 -----
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLoginModal(); closeSignupModal(); closeMobileMenu(); }
});

// ----- 모바일 햄버거 메뉴 -----
function injectMobileMenu() {
  if (document.getElementById('mobileMenuBtn')) return;
  const nav = document.querySelector('nav.nav');
  if (!nav) return;
  const btn = document.createElement('button');
  btn.id = 'mobileMenuBtn';
  btn.className = 'mobile-menu-btn';
  btn.setAttribute('aria-label', '메뉴 열기');
  btn.innerHTML = '<span></span><span></span><span></span>';
  btn.onclick = toggleMobileMenu;
  nav.parentNode.insertBefore(btn, nav);
  nav.addEventListener('click', e => { if (e.target.tagName === 'A') closeMobileMenu(); });
  document.addEventListener('click', e => {
    if (!e.target.closest('nav.nav') && !e.target.closest('#mobileMenuBtn')) closeMobileMenu();
  });
}

function toggleMobileMenu() {
  const nav = document.querySelector('nav.nav');
  const btn = document.getElementById('mobileMenuBtn');
  if (!nav) return;
  const isOpen = nav.classList.toggle('open');
  if (btn) btn.classList.toggle('open', isOpen);
  if (isOpen) updateMobileNavAuth();
}

function closeMobileMenu() {
  const nav = document.querySelector('nav.nav');
  const btn = document.getElementById('mobileMenuBtn');
  if (nav) nav.classList.remove('open');
  if (btn) btn.classList.remove('open');
}

function updateMobileNavAuth() {
  let authArea = document.getElementById('mobileNavAuth');
  if (!authArea) {
    authArea = document.createElement('div');
    authArea.id = 'mobileNavAuth';
    authArea.className = 'mobile-nav-auth';
    document.querySelector('nav.nav')?.appendChild(authArea);
  }
  const session = getSession();
  if (session) {
    authArea.innerHTML = `
      <a href="mypage.html" class="mobile-nav-link" onclick="closeMobileMenu()">${session.name}님 · 마이페이지</a>
      <button class="mobile-nav-link" onclick="authLogout();closeMobileMenu()">로그아웃</button>
      <a href="admin-test.html" class="mobile-nav-link mobile-nav-link--admin" onclick="closeMobileMenu()">관리자</a>`;
  } else {
    authArea.innerHTML = `
      <button class="mobile-nav-link" onclick="closeMobileMenu();setTimeout(openLoginModal,100)">로그인</button>
      <button class="mobile-nav-link" onclick="closeMobileMenu();setTimeout(openSignupModal,100)">회원가입</button>
      <a href="admin-test.html" class="mobile-nav-link mobile-nav-link--admin" onclick="closeMobileMenu()">관리자</a>`;
  }
}

// ----- 초기화 -----
injectAuthModals();
updateHeaderAuth();
injectMobileMenu();
