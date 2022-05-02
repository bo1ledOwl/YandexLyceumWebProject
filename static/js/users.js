function user_details_page(user_id) {
  fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/user/${user_id}`, {
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
          <div id="posts-list"></div>`;
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
    if (verify_data(content, 'password')) {
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
          if (data['message'] == 'ok') {
            index_page();
          }
        })
      })
    }
  }
}

function get_posts(user_id = 0, from = 0, amount = 10) {
  fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/posts/${user_id}/${from}/${amount}/`, {
    method: "GET",
    credentials: 'same-origin',
  }).then((res) => {
    res.json().then((data) => {
      let list = document.getElementById('posts-list')
      if (data.length != 0) {
        for (let i = 0; i < data.length; i++) {
          list.innerHTML += `<div class="post">
                            <div class="post-creator-data">
                              <a onclick="user_details_page(${data[i]['user_id']})">${data[i]['user_name']}</a>
                            </div>
                            <p>${data[i]['content']}</p>
                          </div>`;
        };
      }
      else {
        list.innerHTML = '<h2 style="text-align: center;">Ничего не найдено</h2>';
      }
    })
  })
}