const header = document.getElementById('right');
const content_container = document.getElementById('content');

window.onpopstate = function (e) { change_state(); };
window.onload = function () {
  load_user_data();
  change_state();
};

function change_state() {
  cur_url = String(document.location).split('/').slice(3).join('/');
  if (cur_url == '') {
    index_page();
  }
  else if (cur_url.startsWith('login') && user_data == {}) {
    login_page();
  }
  else if (cur_url.startsWith('register') && user_data == {}) {
    register_page();
  }
  else if (cur_url.split('/')[0] == 'user') {
    user_details_page(parseInt(cur_url.split('/')[1]));
  }
  else if (cur_url.startsWith('posts/create_post') && user_data !== {}) {
    post_creation_page();
  }
}

function load_user_data() {
  let cookie = document.cookie.split(';');
  for (var i = 0; i < cookie.length; i++) {
    if (cookie[i].trim().startsWith('token=')) {
      token = cookie[i].slice('token='.length + 1);
      if (token) {
        user_data = get_data_from_token(['name', 'id', 'exp']);
      }
    }
  }
  fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/login/`, {
    method: "GET",
    headers: {
      "Authentication": token,
    },
  }).then((res) => {
    res.json().then((data) => {
      if (data['message'] !== 'token is verified') {
        logout();
      }
    })
  }
  )
}

function get_data_from_token(keys = []) {
  let res = {}
  keys.forEach((elem) => {
    res[elem] = parseJwt(token)[elem];
  })
  return res;
}

function save_user_data(data) {
  token = data['token'];
  document.cookie = `token=${token}; path=/; max-age=604800; samesite=strict; secure;`;
  user_data = get_data_from_token(['name', 'id', 'exp']);
}

function default_links() {
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

function index_page() {
  document.title = 'Публикации';
  window.history.pushState('', "Публикации", "/");
  content_container.innerHTML = '<div id="posts-list"></div>';
  default_links();
  get_posts();
}