import { PixabayApi } from './js/fetchImages';
import markupGallery from './templates/markupGallery.hbs';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  searchBtn: document.querySelector('.submit-btn'),
  input: document.querySelector('input'),
};

const simpleLightbox = new SimpleLightbox('.photo-card a', {
  captionDelay: 250,
});

const pixabayApi = new PixabayApi();

refs.searchForm.addEventListener('submit', onSearchFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreSubmit);

async function onSearchFormSubmit(event) {
  event.preventDefault();
  refs.gallery.innerHTML = '';
  refs.loadMoreBtn.classList.add('is-hidden');
  pixabayApi.page = 1;
  pixabayApi.searchQuery = event.target.elements.searchQuery.value.trim();

  if (!pixabayApi.searchQuery) {
    Notiflix.Notify.failure('Enter the keyword, please');
    return;
  }

  refs.searchBtn.disabled = true;

  try {
    const searchResult = await pixabayApi.fetchImages();
    const imagesArr = searchResult.data.hits;

    if (imagesArr.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      throw new Error('Limit error');
    }

    refs.gallery.innerHTML = markupGallery(imagesArr);
    simpleLightbox.refresh();
    Notiflix.Notify.info(
      `Hooray! We found ${searchResult.data.totalHits} images.`
    );
    if (searchResult.data.totalHits > pixabayApi.per_page) {
      refs.loadMoreBtn.classList.remove('is-hidden');
    }
    refs.searchBtn.disabled = false;
  } catch (err) {
    console.log(err);
  }

  refs.input.value = '';
}

async function onLoadMoreSubmit() {
  pixabayApi.page += 1;

  try {
    const searchResult = await pixabayApi.fetchImages();
    const imagesArr = searchResult.data.hits;
    refs.gallery.insertAdjacentHTML('beforeend', markupGallery(imagesArr));
    simpleLightbox.refresh();
    slowScroll();
    if (
      Math.ceil(searchResult.data.totalHits / pixabayApi.per_page) <
      pixabayApi.page
    ) {
      refs.loadMoreBtn.classList.add('is-hidden');
      Notiflix.Notify.info(
        "'We're sorry, but you've reached the end of search results."
      );
    }
  } catch (err) {
    console.log(err);
  }
}

function slowScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
