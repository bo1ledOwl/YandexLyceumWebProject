window.onpopstate = function (e) { change_state(); };
window.onload = function () { change_state(); };

function change_state() {
  cur_url = String(document.location).split('/').slice(3).join('/');
  if (cur_url == '') {
    this.index_page();
  }
  else if (cur_url == 'login/') {
    this.login_page();
  }
}

function index_page() {
  document.title = 'Новости';
  window.history.pushState('', "Новости", "/");
  document.getElementById('content').innerHTML = 'главная страница';
}

function login_page(error = '', email = '') {
  document.title = 'Вход';
  window.history.pushState('', "Вход", "/login/");
  document.getElementById('content').innerHTML = `
  <input name="email" required placeholder="Логин" value="${email}">
  <input name="password" required placeholder="Пароль" type="password">
  <button onclick="login()">Войти</button>
  <div class="form-error">${error}</div>`;
}

function login() {
  fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      email: document.getElementsByName('email')[0].value,
      password: document.getElementsByName('password')[0].value
    }),
  }).then((res) => {
    res.json().then((data) => {
      if (data['error'] === 'wrong-data') {
        login_page('Неверный логин или пароль', data['email'])
      };
    });
  });
}