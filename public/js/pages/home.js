import { updateCartUI, initializeCartListeners } from '../cart.js';
import { fetchAllBooks, getBooks } from '../bookService.js';
import { 
    createBookCardHTML, 
    initializeGlobalUI, 
    initializeBackToTopButton,
    initializeBookModal,
    initializeProfileDropdown
} from '../ui.js';

function renderCatalogCarousel(books) {
    const carouselWrapper = document.getElementById('books-carousel-wrapper');
    if (!carouselWrapper) return;

    carouselWrapper.innerHTML = books.map(book => `
        <div class="swiper-slide h-auto pb-10">
            ${createBookCardHTML(book)}
        </div>
    `).join('');
}

function initializeCarousel() {
    if (typeof Swiper === 'undefined') {
        console.error('Swiper.js não foi carregado. Certifique-se de que o script está incluído no seu HTML.');
        return;
    }
    
    const swiperEl = document.querySelector('.books-carousel');
    if (swiperEl) {
        new Swiper(swiperEl, {
            loop: true,
            slidesPerView: 1.5,
            spaceBetween: 20,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    initializeCarousel();    
    updateCartUI();
    initializeCartListeners();
    initializeGlobalUI();
    initializeBackToTopButton();
    initializeBookModal();
    initializeProfileDropdown();

    //Puxar livros da API
    await fetchAllBooks();
    const books = getBooks();
    renderCatalogCarousel(books);
});