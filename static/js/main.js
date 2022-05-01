const header = document.getElementById('right');
const content_container = document.getElementById('content');

window.onpopstate = function (e) { change_state(); };
window.onload = function () { change_state(); };

function change_state() {
  cur_url = String(document.location).split('/').slice(3).join('/');
  if (cur_url == '') {
    index_page();
  }
  else if (cur_url == 'login/') {
    login_page();
  }
  else if (cur_url == 'register/') {
    register_page();
  }
}

function index_page() {
  document.title = 'Публикации';
  window.history.pushState('', "Публикации", "/");
  content_container.innerHTML = 'главная страница';
  if (username == '') {
    header.innerHTML = `
    <a class="auth-link" onclick="login_page()">Вход</a>
    <a class="auth-link" onclick="register_page()">Регистрация</a>`
  }
  else {
    header.innerHTML = `
    <a class="auth-link" onclick="user_info()">${username}</a>
    <a class="auth-link" onclick="logout()">Выйти</a>`
  }
}