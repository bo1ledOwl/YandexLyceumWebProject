var user_data = {};
var token = '';

function verify_data(data, type) {  // проверка данных как в functions.py
  const symbols = 'qwertyuiopasdfghjklzxcvbnm0123456789_-'
  const email_symbols = symbols + '.@'
  const password_symbols = symbols + '.@!#$%^&*(),/'
  const username_symbols = symbols + 'ёйцукенгшщзхъфывапролджжэячсмитьбю '
  const posts_symbols = password_symbols + 'ёйцукенгшщзхъфывапролджжэячсмитьбю '
  let data_lower = data.toLowerCase()
  if (data_lower.length < 64 && data != '') {
    if (type == 'email') {
      for (var i = 0; i < data_lower.length; i++) if (!email_symbols.includes(data_lower[i])) return false;
      if (!data_lower.includes('@')) return false;
    }
    else if (type == 'username') for (var i = 0; i < data_lower.length; i++) if (!username_symbols.includes(data_lower[i])) return false;
    else if (type == 'password') for (var i = 0; i < data_lower.length; i++) if (!password_symbols.includes(data_lower[i])) return false;
    else if (type == 'post') for (var i = 0; i < data_lower.length; i++) if (!posts_symbols.includes(data_lower[i])) return false;
    return true;
  }
  return false;
}

function login_page(error = '', email = '') {  // страница входа
  if (user_data['name'] === undefined) {  // уже вошедшие пользователи не допускаются
    document.title = 'Вход';
    window.history.pushState('', "Вход", "/login/");
    header.innerHTML = `
    <a onclick="register_page()">Регистрация</a>`
    content_container.innerHTML = `
    <div class="auth-form">
    <input name="email" placeholder="Адрес почты" value="${email}">
    <input name="password" placeholder="Пароль" type="password">
    <button onclick="login()">Войти</button>
    <div class="form-error">${error}</div>
    </div>`;
  }
}

function register_page(error = '', name = '') {  // страница регистрации
  if (user_data['name'] === undefined) {  // уже вошедшие пользователи не допускаются
    document.title = 'Регистрация';
    window.history.pushState('', "Регистрация", "/register/");
    header.innerHTML = `
    <a onclick="login_page()">Вход</a>`
    content_container.innerHTML = `
    <div class="auth-form">
    <input name="username" placeholder="Имя пользователя" value="${name}">
    <input name="email" placeholder="Почта">
    <input name="password" placeholder="Пароль" type="password">
    <button onclick="register()">Зарегистрироваться</button>
    <div class="form-error">${error}</div>
    </div>`;
  }
}


function login() {  // запрос для входа
  if (user_data['name'] === undefined) {  // уже вошедшие пользователи не допускаются
    let email = document.getElementsByName('email')[0].value;
    let password = document.getElementsByName('password')[0].value;
    if (verify_data(email, 'email') && verify_data(password, 'password')) {
      fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      }).then((res) => {
        res.json().then((data) => {  // проверка ответа от сервера
          if (data['message'] !== undefined) login_page('Неверный логин или пароль', email);
          else {
            save_user_data(data);
            index_page();
          };
        });
      });
    }
    else login_page('Недопустимые данные', email);
  }
}

function register() {  // запрос для регистрации
  if (user_data['name'] === undefined) {  // уже вошедшие пользователи не допускаются
    let name = document.getElementsByName('username')[0].value;
    let email = document.getElementsByName('email')[0].value;
    let password = document.getElementsByName('password')[0].value;
    if (verify_data(name, 'username') && verify_data(email, 'email') && verify_data(password, 'password')) {
      let name = document.getElementsByName('username')[0].value
      fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          username: name,
          email: email,
          password: password
        }),
      }).then((res) => {
        res.json().then((data) => {  // проверка ответа от сервера
          if (data['message'] !== undefined) register_page('Пользователь с таким адресом электронной почты уже существует', name);
          else {
            save_user_data(data);
            index_page();
          };
        });
      });
    }
    else register_page('Недопустимые данные', name);
  }
}

function logout() {  // удаление сохранённых данных о пользователе
  document.cookie = `token=${token}; path=/; max-age: -1; secure`;
  token = '';
  document.cookie = `path=/; max-age: -1; secure`;
  user_data = {};
  index_page();
}