import { addToCart } from './cart.js';
import { getBookById, getBooks } from './bookService.js';

let swiperInstances = [];

export function createBookCardHTML(book) {
    const hasEditions = book.editions && book.editions.length > 0;
    
    let priceHTML = '<span class="text-lg text-red-500 font-semibold">Indisponível</span>';
    let formatsHTML = '';

    if (hasEditions) {
        const lowestPrice = Math.min(...book.editions.map(e => e.price));
        priceHTML = `<span class="text-2xl font-bold text-blue-800">A partir de R$ ${lowestPrice.toFixed(2).replace('.', ',')}</span>`;
        
        formatsHTML = `<span class="text-sm text-gray-500">${book.editions.map(e => e.format).join(' | ')}</span>`;
    }

    return `
        <div class="bg-white rounded-xl book-hover flex flex-col h-full overflow-hidden cursor-pointer" data-book-id="${book.id}"> 
            
            <div class="h-72 flex items-center justify-center bg-gray-100 p-4">
                <img src="${book.coverImage}" alt="Capa do livro ${book.title}" class="max-h-full w-auto object-contain">
            </div>

            <div class="p-6 flex flex-col flex-1"> 
                <h3 class="text-xl font-bold text-gray-800 mb-2">${book.title}</h3>
                <p class="text-gray-600 mb-2">${book.author}</p>
                <div class="mt-auto"> 
                    <div class="flex justify-between items-center mb-4">
                        ${priceHTML}
                        ${formatsHTML}
                    </div>
                    <button 
                        class="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors add-to-cart ${!hasEditions ? 'opacity-50 cursor-not-allowed' : ''}" 
                        data-book-id="${book.id}"
                        ${!hasEditions ? 'disabled' : ''}>
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function debounce(func, wait = 200) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function initializeGlobalUI() {
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');

    if (cartBtn && cartModal && closeCart) {
        cartBtn.addEventListener('click', () => cartModal.classList.remove('hidden'));
        closeCart.addEventListener('click', () => cartModal.classList.add('hidden'));
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.classList.add('hidden');
            }
        });
    }

    setupSearchRedirect();

    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.add-to-cart');
        if (!button || button.disabled) return;

        const bookId = parseInt(button.dataset.bookId, 10);
        let formatToAdd;

        const modal = event.target.closest('#book-modal');
        if (modal) {
            const selectedButton = modal.querySelector('.format-btn.selected');
            if (selectedButton) {
                formatToAdd = selectedButton.dataset.format;
            }
        } else {
            const book = getBookById(bookId);
            if (book && book.editions && book.editions.length > 0) {
                const cheapestEdition = [...book.editions].sort((a, b) => a.price - b.price)[0];
                formatToAdd = cheapestEdition.format;
            }
        }
        
        if (formatToAdd) {
            addToCart(bookId, formatToAdd);

            button.textContent = 'Adicionado!';
            button.classList.replace('bg-orange-500', 'bg-green-500');
            
            setTimeout(() => {
                button.textContent = 'Adicionar ao Carrinho';
                button.classList.replace('bg-green-500', 'bg-orange-500');
            }, 2000);
        }
    });
}

export function setupSearchRedirect() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `./busca.html?q=${encodeURIComponent(query)}`;
            }
        }
    });
}

export function initializeBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (!backToTopBtn) return; 

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('btn-visible');
        } else {
            backToTopBtn.classList.remove('btn-visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' 
        });
    });
}

export function initializeBookModal() {
    const modal = document.getElementById('book-modal');
    if (!modal) return;

    const modalContent = document.getElementById('book-modal-content');
    const closeModalBtn = document.getElementById('close-book-modal');
    const addToCartBtn = document.getElementById('modal-add-to-cart-btn');
    const priceEl = document.getElementById('modal-book-price');
    const formatsContainer = document.getElementById('modal-book-formats');

    if (!modalContent || !closeModalBtn || !addToCartBtn || !priceEl || !formatsContainer) {
        console.error("Um ou mais elementos do modal não foram encontrados no DOM.");
        return;
    }

    const closeModal = () => {
        modalContent.classList.remove('scale-100');
        modal.classList.remove('opacity-100');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    const openModal = (book) => {
        document.getElementById('modal-book-image').src = book.coverImage;
        document.getElementById('modal-book-title').textContent = book.title;
        document.getElementById('modal-book-author').textContent = book.author;
        document.getElementById('modal-book-description').textContent = book.description;
        addToCartBtn.dataset.bookId = book.id;
        formatsContainer.innerHTML = '';
        const allPossibleFormats = ['Capa Dura', 'Capa Comum', 'E-book'];
        const firstAvailableEdition = book.editions[0];
        if (firstAvailableEdition) {
            priceEl.textContent = `R$ ${firstAvailableEdition.price.toFixed(2).replace('.', ',')}`;
        }
        allPossibleFormats.forEach(formatName => {
            const edition = book.editions.find(e => e.format === formatName);
            const button = document.createElement('button');
            button.textContent = formatName;
            if (edition) {
                button.className = 'format-btn px-4 py-2 border-2 rounded-lg font-semibold transition-colors';
                button.dataset.price = edition.price;
                button.dataset.format = edition.format;
                if (firstAvailableEdition && edition.format === firstAvailableEdition.format) {
                    button.classList.add('selected');
                }
            } else {
                button.className = 'px-4 py-2 border-2 border-gray-300 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed';
                button.disabled = true;
            }
            formatsContainer.appendChild(button);
        });
        const ratingContainer = document.getElementById('modal-book-rating');
        ratingContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            ratingContainer.innerHTML += `<svg class="w-5 h-5 ${i <= book.rating ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
        }
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('opacity-100');
            modalContent.classList.add('scale-100');
        }, 10);
    };

    document.body.addEventListener('click', (e) => {
        const bookCard = e.target.closest('[data-book-id]');
        const isAddToCartClick = e.target.closest('.add-to-cart');

        if (bookCard && !isAddToCartClick) {
            const bookId = bookCard.dataset.bookId;
            const book = getBookById(bookId);
            if (book && book.editions && book.editions.length > 0) {
                openModal(book);
            }
        }
    });

    formatsContainer.addEventListener('click', (e) => {
        const clickedButton = e.target.closest('.format-btn');
        if (!clickedButton || clickedButton.disabled) return;

        formatsContainer.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('selected'));
        clickedButton.classList.add('selected');

        const newPrice = parseFloat(clickedButton.dataset.price);
        priceEl.textContent = `R$ ${newPrice.toFixed(2).replace('.', ',')}`;
    });

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

export function setupSidebars() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const mobileToggle = document.getElementById('sidebar-toggle');
    const desktopToggleBtn = document.getElementById('desktop-sidebar-toggle');
    
    if (desktopToggleBtn) {
        desktopToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    if (sidebar && mobileToggle && overlay) {
        const externalCloseBtn = document.getElementById('external-sidebar-close-btn');
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');

        const openMobileSidebar = () => {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            externalCloseBtn?.classList.remove('hidden');
        };

        const closeMobileSidebar = () => {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            externalCloseBtn?.classList.add('hidden');
        };

        mobileToggle.addEventListener('click', () => {
            if (sidebar.classList.contains('-translate-x-full')) {
                openMobileSidebar();
            } else {
                closeMobileSidebar();
            }
        });

        overlay.addEventListener('click', closeMobileSidebar);
        externalCloseBtn?.addEventListener('click', closeMobileSidebar);
        applyFiltersBtn?.addEventListener('click', closeMobileSidebar);
        clearFiltersBtn?.addEventListener('click', closeMobileSidebar);
    }
}

export function setupBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('btn-visible', window.scrollY > 300);
    });
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

export function setupFilters(renderFunction) {
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

    const applyFilters = () => {
        const minPrice = parseFloat(minPriceEl.value) || 0;
        const maxPrice = parseFloat(maxPriceEl.value) || Infinity;
        const getCheckedValues = (checkboxes) => Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
        const selectedFormats = getCheckedValues(formatCheckboxes);
        const selectedLanguages = getCheckedValues(languageCheckboxes);
        const authorQuery = authorInputEl.value.trim().toLowerCase();

        const filteredBooks = getBooks().filter(book => {
            const ratingMatch = book.rating >= selectedRating;
            const priceMatch = book.editions.some(edition => edition.price >= minPrice && edition.price <= maxPrice);
            const formatMatch = selectedFormats.length === 0 || book.editions.some(edition => selectedFormats.includes(edition.format));
            const languageMatch = selectedLanguages.length === 0 || selectedLanguages.includes(book.language);
            const authorMatch = authorQuery === '' || book.author.trim().toLowerCase().includes(authorQuery);
            return ratingMatch && priceMatch && formatMatch && languageMatch && authorMatch;
        });
        
        renderFunction(filteredBooks);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        minPriceEl.value = '';
        maxPriceEl.value = '';
        authorInputEl.value = '';
        formatCheckboxes.forEach(cb => cb.checked = false);
        languageCheckboxes.forEach(cb => cb.checked = false);
        selectedRating = 0;
        stars.forEach(s => s.classList.replace('text-yellow-400', 'text-gray-300'));
        
        renderFunction(getBooks());
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.getElementById('apply-filters-btn')?.addEventListener('click', applyFilters);
    document.getElementById('clear-filters-btn')?.addEventListener('click', clearFilters);
}

export function createCarouselSectionHTML(title, books, sectionId, noResultsMessage) {
    if (!books || books.length === 0) {
        if (!noResultsMessage) return '';
        return `
            <section class="container mx-auto px-4 mb-0">
                <h2 class="text-3xl font-bold text-gray-200 pb-2 border-b-2 border-gray-500">${title}</h2>
                <p class="text-lg text-gray-300 mt-6 bg-white/5 p-6 rounded-lg">${noResultsMessage}</p>
            </section>
        `;
    }

    const bookSlidesHTML = books.map(book => `<div class="swiper-slide h-auto pb-10">${createBookCardHTML(book)}</div>`).join('');

    return `
        <section class="container mx-auto px-4 mb-2">
            <div class="flex items-center justify-between mb-2">
                <h2 class="text-3xl font-bold text-gray-200 pb-2 border-b-2 border-gray-500">${title}</h2>
                <div class="flex space-x-2 shrink-0">
                    <button class="swiper-button-prev-${sectionId} w-9 h-9 md:w-10 md-h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-50" aria-label="Slide anterior">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button class="swiper-button-next-${sectionId} w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-50" aria-label="Próximo slide">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
            <div class="relative">
                <div class="swiper category-swiper w-full overflow-hidden py-4" id="swiper-${sectionId}">
                    <div class="swiper-wrapper">${bookSlidesHTML}</div>
                </div>
            </div>
        </section>
    `;
}

export function initializeCarousels() {
    if (typeof Swiper === 'undefined') return;
    
    swiperInstances.forEach(swiper => swiper.destroy(true, true));
    swiperInstances = [];

    document.querySelectorAll('.category-swiper').forEach(container => {
        const sectionId = container.id.replace('swiper-', '');
        new Swiper(container, {
            slidesPerView: 1.1, spaceBetween: 16,
            navigation: {
                nextEl: `.swiper-button-next-${sectionId}`,
                prevEl: `.swiper-button-prev-${sectionId}`,
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

export function initializeProfileDropdown() {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (!profileBtn || !profileDropdown) return;

    const logoutBtn = document.getElementById('logout-btn');

    const toggleDropdown = (event) => {
        event.stopPropagation();
        const isVisible = profileDropdown.classList.contains('visible');

        if (isVisible) {
            profileDropdown.classList.remove('opacity-100', 'visible');
            profileDropdown.classList.add('opacity-0', 'invisible');
        } else {
            profileDropdown.classList.remove('opacity-0', 'invisible');
            profileDropdown.classList.add('opacity-100', 'visible');
        }
    };

    profileBtn.addEventListener('click', toggleDropdown);

    window.addEventListener('click', () => {
        if (profileDropdown.classList.contains('visible')) {
            profileDropdown.classList.remove('opacity-100', 'visible');
            profileDropdown.classList.add('opacity-0', 'invisible');
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Você foi desconectado!');
            window.location.href = 'login.html';
        });
    }
}

