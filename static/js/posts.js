var loaded_posts = 0;
var displayed_posts = 0;


function get_posts(user_id = 0, amount = 2) {  // запрос на получение постов и их отображение
  if (loaded_posts > -1) {
    fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/posts/${user_id}/${loaded_posts}/${amount}/`, {
      method: "GET",
      credentials: 'same-origin',
    }).then((res) => {
      res.json().then((data) => {
        let list = document.getElementById('posts-list')
        let loading_button = document.getElementById('load-more');
        if (data.length != 0) {
          loaded_posts += data.length;
          displayed_posts += data.length;
          for (let i = 0; i < data.length; i++) {
            list.innerHTML += `<div class="post" id="post${data[i]['id']}">
                                <div class="post-creator-data" onclick="user_details_page(${data[i]['user_id']})">
                                  <a>${data[i]['user_name']}</a>
                                </div>
                                <p>${data[i]['content']}</p>
                                ${user_data['id'] == data[i]['user_id'] ?
                `<button class="delete-button" onclick="delete_post(${data[i]['id']})">Удалить публикацию</button>` : ''}
                              </div>`;
          };
          // проверка на окончание постов
          if (data.length < amount) {
            loaded_posts = -1;
            loading_button.style.display = 'none';
          }
        }
        else {
          loaded_posts = -1;
          loading_button.style.display = 'none';
          if (displayed_posts == 0) list.innerHTML = '<h2 style="text-align: center;">Ничего не найдено</h2>';
        }
      })
    })
  }
}

function delete_post(post_id) {  // удаление поста
  fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/post/${post_id}/`, {
    method: "DELETE",
    credentials: 'same-origin',
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Authentication": token,
    },
  }).then((res) => {
    res.json().then((data) => {
      if (data['message'] == 'ok') {
        document.getElementById(`post${post_id}`).style.display = 'none';
        displayed_posts -= 1;
      }
    })
  })
}


function user_details_page(user_id) {  // загрузка информации о пользователе
  fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/user/${user_id}/`, {
    method: "GET",
  }).then((res) => {
    res.json().then((data) => {
      default_links()
      window.history.pushState('', data['name'], `/user/${user_id}/`);
      if (data['message'] === undefined) {
        document.title = data['name'];
        content_container.innerHTML = `
          <div id="user-data">
            <h3>${data['name']}</h3>
          </div>
          <div id="posts-list"></div>
          <button id="load-more" onclick=get_posts()>Загрузить ещё</button>`;
        loaded_posts = 0;
        displayed_posts = 0;
        get_posts(user_id);
      }
      else {
        document.title = 'Не найдено';
        content_container.innerHTML = `
          <div id="user-data">
            <h3>Ничего не найдено</h3>
          </div>`;
      }
    })
  })
}


function post_creation_page(content = '', error = '') {
  document.title = 'Создание публикации';
  window.history.pushState('', 'Создание публикации', "/posts/create_post/");
  default_links();
  content_container.innerHTML = `
    <div id="post-creation-form">
    <textarea name="content" placeholder="Введите текст">${content}</textarea>
    <button onclick="create_post()">Опубликовать</button>
    <div class="form-error">${error}</div>
    </div>`;
}


function create_post() {
  if (user_data !== {}) {
    let content = document.getElementsByName('content')[0].value;
    if (verify_data(content, 'post')) {
      fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/posts/create_post/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          'Authentication': token,
        },
        body: JSON.stringify({
          content: content,
        }),
      }).then((res) => {
        res.json().then((data) => {
          if (data['message'] == 'ok') index_page();
        })
      })
    }
  }
}