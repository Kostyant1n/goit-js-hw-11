import { fetchImages } from './fetchImages';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');
let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

searchForm.addEventListener('submit', onSearchForm);
btnLoadMore.addEventListener('click', onBtnLoadMore);

function onSearchForm(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.searchQuery.value.trim();
  gallery.innerHTML = '';
  btnLoadMore.classList.add('is-hidden');

  if (query === '') {
    Notiflix.Notify.failure('The search string cannot be empty. Please specify your search query.');
    return;
  }

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
        );
      } else {
        renderImages(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

        if (data.totalHits > perPage) {
          btnLoadMore.classList.remove('is-hidden');
        }
      }
    })
    .catch(error => console.log(error));
}

function onBtnLoadMore() {
  page += 1;
  simpleLightBox.destroy();

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      renderImages(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();

      const totalPages = Math.ceil(data.totalHits / perPage);

      console.log(data.totalHits / perPage);
      console.log(totalPages);

      if (page > totalPages) {
        btnLoadMore.classList.add('is-hidden');
        Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
      }
    })
    .catch(error => console.log(error));
}

function renderImages(images) {
  const markup = images
    .map(
      image => `
        <a class="gallery__link" href="${image.largeImageURL}">
          <div class="photo-card" id="${image.id}">
            <img class="photo-card__img" src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            <div class="info">
              <p class="info-item"><b>Likes</b>${image.likes}</p>
              <p class="info-item"><b>Views</b>${image.views}</p>
              <p class="info-item"><b>Comments</b>${image.comments}</p>
              <p class="info-item"><b>Downloads</b>${image.downloads}</p>
            </div>
          </div>
        </a>
      `,
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}
