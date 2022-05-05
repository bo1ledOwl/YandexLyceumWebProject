// .pushState позволяет изменять адрес в адресной строке без перехода на другую страницу


const header = document.getElementById('right');
const content_container = document.getElementById('content');

window.onpopstate = function (e) { change_state(); };
window.onload = function () {
  load_user_data();
  change_state();
};

function change_state() {  // загрузка всех возможных страниц в соответствии с адресом
  cur_url = String(document.location).split('/').slice(3).join('/');
  switch (cur_url) {
    case '':
      index_page();
      break;
    case cur_url.startsWith('login') ? cur_url : 0:
      if (user_data == {}) login_page();
      break;
    case cur_url.startsWith('register') ? cur_url : 0:
      if (user_data == {}) register_page();
      break;
    case cur_url.startsWith('user/') ? cur_url : 0:
      user_details_page(parseInt(cur_url.split('/')[1]));
      break;
    case cur_url.startsWith('posts/create_post') ? cur_url : 0:
      if (user_data !== {}) post_creation_page();
      break;
  }
}

function load_user_data() {  // загрузка данных о пользователе из cookie
  let cookie = document.cookie.split(';');
  for (var i = 0; i < cookie.length; i++) {
    if (cookie[i].trim().startsWith('token=')) {
      token = cookie[i].slice('token='.length + 1);
      if (token) user_data = get_data_from_token(['name', 'id', 'exp']);
    }
  }
  fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/login/`, {  // проверка полученных данных путём обращения к серверу
    method: "GET",
    headers: {
      "Authentication": token,
    },
  }).then((res) => {
    res.json().then((data) => {
      if (data['message'] !== 'token is verified') logout();
    })
  }
  )
}


function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  
  return JSON.parse(jsonPayload);
};


function get_data_from_token(keys = []) {  // расшифровка токена
  let res = {}
  keys.forEach((elem) => {
    res[elem] = parseJwt(token)[elem];
  })
  return res;
}

function save_user_data(data) {  // сохранение данных о пользоваете в переменную и cookie
  token = data['token'];
  document.cookie = `token=${token}; path=/; max-age=604800; samesite=strict; secure;`;
  user_data = get_data_from_token(['name', 'id', 'exp']);
}

function default_links() {  // загрузка header'а в зависимости от того, вошел ли пользователь
  if (user_data['name'] == undefined) {
    header.innerHTML = `
      <a onclick="login_page()">Вход</a>
      <a onclick="register_page()">Регистрация</a>`
  }
  else {
    header.innerHTML = `
      <a onclick="user_details_page(${user_data['id']})">${user_data['name']}</a>
      <a onclick="post_creation_page()" style="font-size: 0.9em">&#x270F;</a>
      <a onclick="logout()">Выйти</a>`
  }
}

function index_page() {  // основная страница со всеми публикациями
  document.title = 'Публикации';
  window.history.pushState('', "Публикации", "/");
  content_container.innerHTML = `<div id="posts-list"></div>
                                 <button id="load-more" onclick=get_posts()>Загрузить ещё</button>`;
  loaded_posts = 0;
  displayed_posts = 0;
  default_links();
  get_posts();
}