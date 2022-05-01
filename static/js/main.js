window.onpopstate = function (e) { change_state(); };
window.onload = function () { change_state(); };

var username = '';

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
  document.title = 'Новости';
  window.history.pushState('', "Новости", "/");
  document.getElementById('content').innerHTML = 'главная страница';
  document.querySelector('header').innerHTML = `<a onclick="index_page(${username})">Главная</a>`
  if (username == '') {
    document.querySelector('header').innerHTML += `
    <a onclick="login_page()">Вход</a>
    <a onclick="register_page()">Регистрация</a>`
  }
  else {
    document.querySelector('header').innerHTML += `
    <a onclick="user_info()">${username}</a>
    <a onclick="logout()">Выйти</a>`
  }
}