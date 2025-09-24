import { fetchAllBooks, getBooks } from '../bookService.js';
import { updateCartUI, initializeCartListeners } from '../cart.js';
import {
    initializeGlobalUI,
    initializeBookModal,
    setupSidebars,
    setupBackToTopButton,
    createBookCardHTML,
    initializeProfileDropdown,
} from '../ui.js';

let initialSearchResults = [];
let initialOtherBooks = [];
let swiperInstances = [];

function createCategorySectionHTML(category, books, messageIfEmpty) {
    if (!books || books.length === 0) {
        return `
            <section class="mb-8">
                <div class="container mx-auto px-4">
                    <h2 class="text-3xl font-bold text-gray-200 pb-2 border-b-2 border-gray-500">${category}</h2>
                    <p class="text-gray-300 py-6">${messageIfEmpty}</p>
                </div>
            </section>
        `;
    }

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
                        <button class="swiper-button-prev-hook w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-50" aria-label="Slide anterior">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button class="swiper-button-next-hook w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-50" aria-label="Próximo slide">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
                <div class="relative">
                    <div class="swiper category-swiper w-full overflow-hidden py-6">
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

    document.querySelectorAll('.category-swiper').forEach((swiperContainer) => {
        const section = swiperContainer.closest('section');
        if (!section) return;

        const nextEl = section.querySelector('.swiper-button-next-hook');
        const prevEl = section.querySelector('.swiper-button-prev-hook');

        const swiper = new Swiper(swiperContainer, {
            slidesPerView: 1.1,
            spaceBetween: 16,
            navigation: {
                nextEl: nextEl,
                prevEl: prevEl,
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

function renderPageContent(results, others) {
    const resultsContainer = document.getElementById('search-results-container');
    const allBooksContainer = document.getElementById('all-books-container');
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';

    resultsContainer.innerHTML = createCategorySectionHTML(
        `Resultados para "${query}"`,
        results,
        'Não encontramos livros com esse padrão. Tente uma busca diferente.'
    );

    const otherBooksByCategory = others.reduce((acc, book) => {
        (acc[book.category] = acc[book.category] || []).push(book);
        return acc;
    }, {});

    allBooksContainer.innerHTML = Object.entries(otherBooksByCategory)
        .map(([category, books]) => {
            return createCategorySectionHTML(`Outros Livros em ${category}`, books, '');
        })
        .join('');

    initializeCarousels();
}

function setupFiltersForSearchPage() {
    const minPriceEl = document.getElementById('min-price');
    const maxPriceEl = document.getElementById('max-price');
    const authorInputEl = document.getElementById('author-input');
    const ratingFilterEl = document.getElementById('rating-filter');
    const stars = ratingFilterEl ? ratingFilterEl.querySelectorAll('.star') : [];
    const formatCheckboxes = document.querySelectorAll('#format-filter input[type="checkbox"]');
    const languageCheckboxes = document.querySelectorAll('#language-filter input[type="checkbox"]');

    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value);
            stars.forEach(s => {
                s.classList.toggle('text-yellow-400', parseInt(s.dataset.value) <= selectedRating);
                s.classList.toggle('text-gray-300', parseInt(s.dataset.value) > selectedRating);
            });
        });
    });

    const filterBookList = (books) => {
        const minPrice = parseFloat(minPriceEl.value) || 0;
        const maxPrice = parseFloat(maxPriceEl.value) || Infinity;
        const authorQuery = authorInputEl.value.trim().toLowerCase();
        const selectedFormats = Array.from(formatCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const selectedLanguages = Array.from(languageCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

        return books.filter(book => {
            const ratingMatch = book.rating >= selectedRating;
            const priceMatch = book.editions.some(e => e.price >= minPrice && e.price <= maxPrice);
            const formatMatch = selectedFormats.length === 0 || book.editions.some(e => selectedFormats.includes(e.format));
            const languageMatch = selectedLanguages.length === 0 || selectedLanguages.includes(book.language);
            const authorMatch = authorQuery === '' || book.author.toLowerCase().includes(authorQuery);
            return ratingMatch && priceMatch && formatMatch && languageMatch && authorMatch;
        });
    };

    const applyFilters = () => {
        const filteredResults = filterBookList(initialSearchResults);
        const filteredOthers = filterBookList(initialOtherBooks);
        renderPageContent(filteredResults, filteredOthers);
    };

    const clearFilters = () => {
        minPriceEl.value = '';
        maxPriceEl.value = '';
        authorInputEl.value = '';
        formatCheckboxes.forEach(cb => cb.checked = false);
        languageCheckboxes.forEach(cb => cb.checked = false);
        selectedRating = 0;
        stars.forEach(s => {
            s.classList.add('text-gray-300');
            s.classList.remove('text-yellow-400');
        });
        renderPageContent(initialSearchResults, initialOtherBooks);
    };

    document.getElementById('apply-filters-btn')?.addEventListener('click', applyFilters);
    document.getElementById('clear-filters-btn')?.addEventListener('click', clearFilters);
}

document.addEventListener('DOMContentLoaded', async () => {
    initializeGlobalUI();
    initializeCartListeners();
    initializeBookModal();
    updateCartUI();
    setupSidebars();
    setupBackToTopButton();

    await fetchAllBooks();
    const books = getBooks();

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q')?.toLowerCase() || '';

    if (document.getElementById('search-input')) {
        document.getElementById('search-input').value = urlParams.get('q') || '';
    }

    if (query) {
        books.forEach(book => {
            if (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)) {
                initialSearchResults.push(book);
            } else {
                initialOtherBooks.push(book);
            }
        });
    } else {
        initialOtherBooks = [...books];
        initialSearchResults = [];
    }
    
    renderPageContent(initialSearchResults, initialOtherBooks);

    setupFiltersForSearchPage();
    initializeProfileDropdown();
});