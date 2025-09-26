import { fetchAllBooks, getBooks } from '../bookService.js';
import { updateCartUI, initializeCartListeners } from '../cart.js';
import { 
    createBookCardHTML, 
    initializeGlobalUI,
    initializeBookModal,
    setupBackToTopButton,
    setupFilters,
    setupSidebars,
} from '../ui.js';
import { logout } from '../auth.js';

let swiperInstances = [];

function groupBooksByCategory(books) {
    if (!books || books.length === 0) {
        return {};
    }
    return books.reduce((acc, book) => {
        const { category } = book;
        (acc[category] = acc[category] || []).push(book);
        return acc;
    }, {});
}

function createCategorySectionHTML(category, books, index) {
    const bookSlidesHTML = books.map(book => `
        <div class="swiper-slide h-auto pb-10">
            ${createBookCardHTML(book)}
        </div>
    `).join('');

    return `
        <section class="mb-2">
            <div class="container mx-auto px-4">
                <div class="flex items-center justify-between mb-0">
                    <h2 class="text-3xl font-bold text-gray-200 pb-2 border-b-2 border-gray-500">${category}</h2>
                    <div class="flex space-x-2 shrink-0">
                        <button class="swiper-button-prev-${index} w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-50" aria-label="Slide anterior">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button class="swiper-button-next-${index} w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-50" aria-label="Próximo slide">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
                <div class="relative">
                    <div class="swiper category-swiper w-full overflow-hidden py-6" id="swiper-${index}">
                        <div class="swiper-wrapper">${bookSlidesHTML}</div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function initializeCarousels() {
    if (typeof Swiper === 'undefined') {
        console.error('Swiper.js não foi carregado.');
        return;
    }

    swiperInstances.forEach(swiper => swiper.destroy(true, true));
    swiperInstances = [];

    document.querySelectorAll('.category-swiper').forEach((container, index) => {
        const swiper = new Swiper(container, {
            slidesPerView: 1.1,
            spaceBetween: 16,
            navigation: {
                nextEl: `.swiper-button-next-${index}`,
                prevEl: `.swiper-button-prev-${index}`,
            },
            breakpoints: {
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                1024: { slidesPerView: 4, spaceBetween: 30 },
            }
        });
        swiperInstances.push(swiper);
    });
}

function renderPageLayout(booksToRender) {
    const container = document.getElementById('categories-container');
    if (!container) return;

    const booksByCategory = groupBooksByCategory(booksToRender);

    if (Object.keys(booksByCategory).length === 0) {
        container.innerHTML = `
            <div class="container mx-auto px-4 pt-10 text-center">
                <h1 class="text-4xl font-bold text-white mb-4">Nenhum livro encontrado</h1>
                <p class="text-lg text-gray-300">Tente ajustar os filtros ou limpá-los para ver mais resultados.</p>
            </div>`;
        return;
    }

    const allSectionsHTML = Object.entries(booksByCategory)
        .map(([category, bookList], index) => createCategorySectionHTML(category, bookList, index))
        .join('');

    container.innerHTML = `
        <div class="container mx-auto px-4 pt-10">
            <h1 class="text-5xl md:text-6xl font-bold text-left text-gray-200 mb-12">Nossas Categorias</h1>
        </div>
        ${allSectionsHTML}`;
    
    initializeCarousels();
}

document.addEventListener('DOMContentLoaded', async () => {
    initializeGlobalUI();
    initializeBookModal();
    initializeCartListeners();
    updateCartUI();
    setupSidebars();
    setupBackToTopButton();

    //Puxar livros da API
    await fetchAllBooks();
    const books = getBooks();
    setupFilters(renderPageLayout);
    renderPageLayout(books);
});