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

function renderBooksGrid(books) {
    const booksGrid = document.getElementById('books-grid');
    if (!booksGrid) return; 

    if (books.length === 0) {
        booksGrid.innerHTML = `<p class="text-xl text-gray-300 col-span-full text-center">Nenhum livro encontrado com os filtros selecionados.</p>`;
    } else {
        booksGrid.innerHTML = books.map(createBookCardHTML).join('');
    }
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
    setupFilters(renderBooksGrid, books);
    renderBooksGrid(books);

});