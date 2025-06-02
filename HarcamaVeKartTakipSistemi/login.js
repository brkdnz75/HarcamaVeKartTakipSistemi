const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorDiv = document.getElementById('login-error');
const registerBtn = document.getElementById('register-btn');

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.style.display = 'block';
  setTimeout(() => { errorDiv.style.display = 'none'; }, 3000);
}

// Kayıt ol
registerBtn.addEventListener('click', function() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    showError('E-posta ve şifre girin!');
    return;
  }
  let users = JSON.parse(localStorage.getItem('mc_users') || '{}');
  if (users[email]) {
    showError('Bu e-posta zaten kayıtlı!');
    return;
  }
  users[email] = password;
  localStorage.setItem('mc_users', JSON.stringify(users));
  showError('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
});

// Giriş yap
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  let users = JSON.parse(localStorage.getItem('mc_users') || '{}');
  if (!users[email]) {
    showError('Bu e-posta ile kayıt bulunamadı!');
    return;
  }
  if (users[email] === password) {
    // Başarılı giriş, index.html'e yönlendir
    localStorage.setItem('user', email);
    window.location.href = 'index.html';
  } else {
    showError('E-posta veya şifre yanlış!');
  }
}); 