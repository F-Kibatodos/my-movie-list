(function () {
  //==============Variables Declaration Area==============//
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []
  const dataPanel = document.getElementById('data-panel')
  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12
  const displayMode = document.querySelector('.display-mode')//陳列方法DOM
  const searchBtn = document.getElementById('submit-search')
  const searchInput = document.getElementById('search')
  let page//抽出event.target.dataset.page放在變數共用
  let paginationData = []
  let defaultPage = 1
  let displayType = 'card'
  console.log((data.length));

  //==============Function Declaration Area==============//

  function displayDataList (data) {
    let htmlContent = ''
    data.forEach(function (item) {
      htmlContent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${item.title}</h5>
            </div>
            <!-- "More" button -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!-- favorite button -->
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = htmlContent
  }

  function showMovie (id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id
    console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  function addFavoriteItem (id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  function getTotalPages (data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData (pageNum = 1, displayType, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    if (displayType === 'card') displayDataList(pageData)
    else if (displayType === 'list') displayDataInList(pageData)
  }

  //display data in list mode
  function displayDataInList(data) {
    let htmlContent = ''
    htmlContent += `
    <table class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Info</th>
          <th>Favorite</th>
        </tr>
      </thead>
    `
    data.forEach(function (item) {
      htmlContent += `
        <tbody>
          <tr>
            <th>${item.title}</hr>
            <th><button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button></th>
            <th><button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button></th>
          </tr>
        </body>
      `
    })
    htmlContent += `</table>`
    dataPanel.innerHTML = htmlContent
  }

  //pagination display in list mode

  //==============Set Events Area==============//

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    //displayDataList(data)
    getTotalPages(data)
    getPageData(1, 'card', data)
  }).catch((err) => console.log(err))

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to search btn click event
  searchBtn.addEventListener('click', event => {
    console.log(data.length);
    //let results = []
    page = 1
    event.preventDefault()
    const regex = new RegExp(searchInput.value, 'i')
    results = data.filter(movie => movie.title.match(regex))
    getTotalPages(results)
    getPageData(1, displayType, results)
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    if (event.target.tagName === 'A') {
      page = event.target.dataset.page
      getPageData(page, displayType)
    }
  })

  //listen to sort event
  displayMode.addEventListener('click', event => {
    if (event.target.matches('.fa-list')) { //點了list顯示方法後
      displayType = 'list'
      getPageData(page, 'list')
    } else if (event.target.matches('.fa-th')) {//點回來card mode
      displayType = 'card'
      getPageData(page, 'card')
    }
  })
})()
