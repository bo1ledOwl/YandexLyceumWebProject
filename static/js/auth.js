function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

function login_page(error = '', email = '') {
    document.title = 'Вход';
    window.history.pushState('', "Вход", "/login/");
    document.querySelector('header').innerHTML = `
    <a onclick="index_page()">Главная</a>
    <a onclick="register_page()">Регистрация</a>`
    document.getElementById('content').innerHTML = `
    <input name="email" required placeholder="Адрес почты" value="${email}">
    <input name="password" required placeholder="Пароль" type="password">
    <button onclick="login()">Войти</button>
    <div class="form-error">${error}</div>`;
}

function register_page(error = '', name = '') {
    document.title = 'Регистрация';
    window.history.pushState('', "Регистрация", "/register/");
    document.querySelector('header').innerHTML = `
    <a onclick="index_page()">Главная</a>
    <a onclick="login_page()">Вход</a>`
    document.getElementById('content').innerHTML = `
    <input name="username" required placeholder="Имя пользователя" value="${name}">
    <input name="email" required placeholder="Почта">
    <input name="password" required placeholder="Пароль" type="password">
    <button onclick="register()">Регистрация</button>
    <div class="form-error">${error}</div>`;
}

function login() {
    let email = document.getElementsByName('email')[0].value;
    let password = document.getElementsByName('password')[0].value;
    if (email !== '' && password !== '') {
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
            res.json().then((data) => {
                if (data['message'] !== undefined) { login_page('Неверный логин или пароль', email) }
                else {
                    username = parseJwt(data['token'])['name'];
                    index_page();
                };
            });
        });
    }
    else {
        login_page('Все поля должны быть заполнены')
    }
}

function register() {
    let name = document.getElementsByName('username')[0].value;
    let email = document.getElementsByName('email')[0].value;
    let password = document.getElementsByName('password')[0].value;
    if (name !== '' && email !== '' && password !== '') {
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
            res.json().then((data) => {
                if (data['message'] !== undefined) { register_page('Пользователь с таким адресом электронной почты уже существует', name = name) }
                else {
                    username = parseJwt(data['token'])['name'];
                    index_page();
                };
            });
        });
    }
    else {
        register_page('Все поля должны быть заполнены')
    }
}

function logout() {
    username = '';
    index_page();
}