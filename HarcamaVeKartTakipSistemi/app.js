const navCards = document.getElementById('nav-cards');
const navAddExpense = document.getElementById('nav-add-expense');
const navStats = document.getElementById('nav-stats');
const cardsSection = document.getElementById('cards-section');
const addExpenseSection = document.getElementById('add-expense-section');
const statsSection = document.getElementById('stats-section');
const errorMsg = document.getElementById('error-msg');

function showSection(section) {
  cardsSection.style.display = 'none';
  addExpenseSection.style.display = 'none';
  statsSection.style.display = 'none';
  section.style.display = 'block';
}

navCards.addEventListener('click', () => showSection(cardsSection));
navAddExpense.addEventListener('click', () => showSection(addExpenseSection));
navStats.addEventListener('click', () => showSection(statsSection));

// Dark Mode
const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
});
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
}

// Login/Logout 
const loginSection = document.getElementById('login-section');
const welcomeSection = document.getElementById('welcome-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const welcomeMsg = document.getElementById('welcome-msg');

function checkLogin() {
  const user = localStorage.getItem('user');
  if (user) {
    loginSection.style.display = 'none';
    welcomeSection.style.display = 'block';
    welcomeMsg.textContent = `Hoş geldin, ${user}`;
  } else {
    loginSection.style.display = 'block';
    welcomeSection.style.display = 'none';
  }
}
loginBtn.addEventListener('click', () => {
  const name = prompt('Kullanıcı adınızı girin:');
  if (name) {
    localStorage.setItem('user', name);
    checkLogin();
  }
});
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  checkLogin();
  window.location.href = 'login.html';
});
checkLogin();

// Error Message
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = 'block';
  setTimeout(() => { errorMsg.style.display = 'none'; }, 3000);
}


showSection(cardsSection);

// KARTLAR: Ekleme, listeleme, silme, localStorage
const addCardForm = document.getElementById('add-card-form');
const cardNameInput = document.getElementById('card-name');
const cardLimitInput = document.getElementById('card-limit');
const cardsList = document.getElementById('cards-list');

function renderCards() {
  const cards = getCards();
  cardsList.innerHTML = '';
  if (cards.length === 0) {
    cardsList.innerHTML = '<li style="color:#888;">Henüz kart eklenmedi.</li>';
    return;
  }
  cards.forEach(card => {
    const li = document.createElement('li');
    li.className = 'card-box' + (card.debt > card.limit ? ' limit-exceeded' : '');
    li.innerHTML = `
      <div class="card-header">
        <span class="card-title">${card.name}</span>
        <button class="card-delete-btn" title="Kartı Sil" data-id="${card.id}">×</button>
      </div>
      <div>
        <span class="card-limit">Limit: ${card.limit.toLocaleString('tr-TR')}₺</span>
        <span class="card-debt">Borç: ${card.debt.toLocaleString('tr-TR')}₺</span>
      </div>
      <div class="card-warning" style="color:#ffe082; font-size:0.95rem; margin-top:0.3rem; ${card.debt > card.limit ? '' : 'display:none;'}">Limit aşıldı!</div>
    `;
    cardsList.appendChild(li);
  });
}
// Kart silme
cardsList.addEventListener('click', function(e) {
  if (e.target.classList.contains('card-delete-btn')) {
    const id = e.target.getAttribute('data-id');
    let cards = getCards();
    cards = cards.filter(card => card.id !== id);
    setCards(cards);
    renderCards();
  }
});
// Kart ekleme
addCardForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = cardNameInput.value.trim();
  const limit = parseFloat(cardLimitInput.value);
  if (!name || isNaN(limit) || limit <= 0) {
    showError('Kart adı ve limit geçerli olmalı!');
    return;
  }
  let cards = getCards();
  if (cards.some(card => card.name.toLowerCase() === name.toLowerCase())) {
    showError('Bu isimde bir kart zaten var!');
    return;
  }
  cards.push({
    id: Date.now().toString(),
    name,
    limit,
    debt: 0
  });
  setCards(cards);
  addCardForm.reset();
  renderCards();
  renderExpenseCardOptions();
  renderStats();
});
renderCards();

// Harcamalar: Ekleme, listeleme, silme, localStorage
const addExpenseForm = document.getElementById('add-expense-form');
const expenseCardSelect = document.getElementById('expense-card-select');
const expenseDescInput = document.getElementById('expense-desc');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCategoryInput = document.getElementById('expense-category');
const expensesList = document.getElementById('expenses-list');

function getExpenses() {
  return JSON.parse(localStorage.getItem('expenses') || '[]');
}
function setExpenses(expenses) {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}
function renderExpenseCardOptions() {
  const cards = getCards();
  expenseCardSelect.innerHTML = '';
  if (cards.length === 0) {
    expenseCardSelect.innerHTML = '<option value="">Kart yok</option>';
    return;
  }
  cards.forEach(card => {
    const opt = document.createElement('option');
    opt.value = card.id;
    opt.textContent = card.name;
    expenseCardSelect.appendChild(opt);
  });
}
function renderExpenses() {
  const expenses = getExpenses();
  const cards = getCards();
  expensesList.innerHTML = '';
  if (expenses.length === 0) {
    expensesList.innerHTML = '<li style="color:#888;">Henüz harcama eklenmedi.</li>';
    return;
  }
  expenses.forEach(exp => {
    const card = cards.find(c => c.id === exp.cardId);
    const li = document.createElement('li');
    li.className = 'expense-box';
    li.innerHTML = `
      <span>
        <span class="expense-desc">${exp.desc}</span>
        <span class="expense-category">${exp.category || 'Genel'}</span>
      </span>
      <span>
        <span class="expense-amount">${exp.amount.toLocaleString('tr-TR')}₺</span>
        <button class="expense-delete-btn" title="Harcama Sil" data-id="${exp.id}">×</button>
      </span>
    `;
    expensesList.appendChild(li);
  });
}
// Harcama silme
expensesList.addEventListener('click', function(e) {
  if (e.target.classList.contains('expense-delete-btn')) {
    const id = e.target.getAttribute('data-id');
    let expenses = getExpenses();
    const exp = expenses.find(x => x.id === id);
    if (exp) {
      // Kart borcundan düş
      let cards = getCards();
      const card = cards.find(c => c.id === exp.cardId);
      if (card) {
        card.debt -= exp.amount;
        setCards(cards);
      }
    }
    expenses = expenses.filter(x => x.id !== id);
    setExpenses(expenses);
    renderExpenses();
    renderCards();
    renderExpenseCardOptions();
    renderStats();
  }
});
// Harcama ekleme
addExpenseForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const cardId = expenseCardSelect.value;
  const desc = expenseDescInput.value.trim();
  const amount = parseFloat(expenseAmountInput.value);
  const category = expenseCategoryInput.value.trim();
  if (!cardId || !desc || isNaN(amount) || amount <= 0) {
    showError('Tüm alanlar (kategori hariç) doldurulmalı ve tutar pozitif olmalı!');
    return;
  }
  let cards = getCards();
  const card = cards.find(c => c.id === cardId);
  if (!card) {
    showError('Seçili kart bulunamadı!');
    return;
  }
  // Harcamayı ekle
  let expenses = getExpenses();
  expenses.push({
    id: Date.now().toString(),
    cardId,
    desc,
    amount,
    category,
    date: new Date().toISOString()
  });
  setExpenses(expenses);
  // Kart borcunu güncelle
  card.debt += amount;
  setCards(cards);
  addExpenseForm.reset();
  renderExpenses();
  renderCards();
  renderExpenseCardOptions();
  renderStats();
  // Limit aşımı animasyonu
  if (card.debt > card.limit) {
    setTimeout(() => {
      const cardEls = document.querySelectorAll('.card-box');
      cardEls.forEach(el => {
        if (el.querySelector('.card-title').textContent === card.name) {
          el.classList.add('limit-exceeded');
          setTimeout(() => el.classList.remove('limit-exceeded'), 800);
        }
      });
    }, 100);
  }
});
// Kart silindiğinde ilgili harcamaları da sil
function deleteExpensesByCard(cardId) {
  let expenses = getExpenses();
  expenses = expenses.filter(exp => exp.cardId !== cardId);
  setExpenses(expenses);
}
// Kart silme fonksiyonunu güncelle
cardsList.addEventListener('click', function(e) {
  if (e.target.classList.contains('card-delete-btn')) {
    const id = e.target.getAttribute('data-id');
    let cards = getCards();
    cards = cards.filter(card => card.id !== id);
    setCards(cards);
    deleteExpensesByCard(id);
    renderCards();
    renderExpenses();
    renderExpenseCardOptions();
    renderStats();
  }
});
// SPA geçişlerinde animasyon ve aktif buton
function setActiveNav(section) {
  [navCards, navAddExpense, navStats].forEach(btn => btn.classList.remove('active'));
  if (section === cardsSection) navCards.classList.add('active');
  if (section === addExpenseSection) navAddExpense.classList.add('active');
  if (section === statsSection) navStats.classList.add('active');
}
function showSection(section) {
  [cardsSection, addExpenseSection, statsSection].forEach(sec => {
    sec.style.display = 'none';
    sec.style.opacity = 0;
    sec.style.transition = 'opacity 0.3s';
  });
  section.style.display = 'block';
  setTimeout(() => { section.style.opacity = 1; }, 10);
  setActiveNav(section);
}
// İstatistikler
const statsContent = document.getElementById('stats-content');
function renderStats() {
  const expenses = getExpenses();
  if (expenses.length === 0) {
    statsContent.innerHTML = '<div style="color:#888;">Henüz harcama yok.</div>';
    return;
  }
  // Toplam harcama
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  // Aylık harcama
  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  // Kategoriye göre harcama
  const catTotals = {};
  expenses.forEach(e => {
    const cat = e.category || 'Genel';
    catTotals[cat] = (catTotals[cat] || 0) + e.amount;
  });
  let catHtml = '';
  Object.entries(catTotals).forEach(([cat, val]) => {
    catHtml += `<div style="margin-bottom:0.3rem;"><b>${cat}:</b> ${val.toLocaleString('tr-TR')}₺</div>`;
  });
  statsContent.innerHTML = `
    <div style="margin-bottom:0.7rem;"><b>Toplam Harcama:</b> ${total.toLocaleString('tr-TR')}₺</div>
    <div style="margin-bottom:0.7rem;"><b>Bu Ay:</b> ${monthTotal.toLocaleString('tr-TR')}₺</div>
    <div><b>Kategoriye Göre:</b><br>${catHtml}</div>
  `;
}

function getCurrentUserEmail() {
  return localStorage.getItem('user') || '';
}
function getCards() {
  const email = getCurrentUserEmail();
  return JSON.parse(localStorage.getItem('cards_' + email) || '[]');
}
function setCards(cards) {
  const email = getCurrentUserEmail();
  localStorage.setItem('cards_' + email, JSON.stringify(cards));
}
function getExpenses() {
  const email = getCurrentUserEmail();
  return JSON.parse(localStorage.getItem('expenses_' + email) || '[]');
}
function setExpenses(expenses) {
  const email = getCurrentUserEmail();
  localStorage.setItem('expenses_' + email, JSON.stringify(expenses));
}

// İlk yükleme
renderCards();
renderExpenseCardOptions();
renderExpenses();
renderStats();
// Kart/harcama eklenince veya silinince otomatik güncellenir
