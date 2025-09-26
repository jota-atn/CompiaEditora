import { fetchAllBooks, getBooks } from '../bookService.js';
import { updateCartUI, initializeCartListeners } from '../cart.js';
import { 
    initializeGlobalUI,
    initializeBookModal,
    setupSidebars,
    setupFilters,
    setupBackToTopButton,
    createCarouselSectionHTML,
    initializeCarousels,
} from '../ui.js';
import { logout } from '../auth.js';


let initialSearchResults = [];
let initialOtherBooks = [];

function renderPageContent(results, others) {
    const resultsContainer = document.getElementById('search-results-container');
    const allBooksContainer = document.getElementById('all-books-container');
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';

    resultsContainer.innerHTML = createCarouselSectionHTML(
        `Resultados para "${query}"`, 
        results, 
        'results', 
        'Não encontramos livros com esse padrão. Tente uma busca diferente.'
    );

    const otherBooksByCategory = others.reduce((acc, book) => {
        (acc[book.category] = acc[book.category] || []).push(book);
        return acc;
    }, {});

    allBooksContainer.innerHTML = Object.entries(otherBooksByCategory)
        .map(([category, books]) => createCarouselSectionHTML(`Outros Livros em ${category}`, books, category.toLowerCase().replace(/\s/g, ''), ''))
        .join('');
    
    setTimeout(initializeCarousels, 0);
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

    //Puxar livros da API
    await fetchAllBooks();
    const books = getBooks();

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q')?.toLowerCase() || '';

    if (document.getElementById('search-input')) {
        document.getElementById('search-input').value = query;
    }

    if (query) {
        booksData.forEach(book => {
            if (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)) {
                initialSearchResults.push(book);
            } else {
                initialOtherBooks.push(book);
            }
        });
    } else {
        initialOtherBooks = [...booksData];
    }
    
    renderPageContent(initialSearchResults, initialOtherBooks);
    
    setupFiltersForSearchPage();
    initializeGlobalUI()
});