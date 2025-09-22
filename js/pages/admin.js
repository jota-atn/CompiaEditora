import { booksData } from '../data.js';

let books = [...booksData];

const addBookBtn = document.getElementById('add-book-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const bookModal = document.getElementById('book-modal');
const modalTitle = document.getElementById('modal-title');
const bookForm = document.getElementById('book-form');
const bookTableBody = document.getElementById('book-table-body');
const editIdInput = document.getElementById('edit-index');

function formatPriceForDisplay(book) {
    if (!book.editions || book.editions.length === 0) {
        return '<span class="text-red-500">Indisponível</span>';
    }
    const lowestPrice = Math.min(...book.editions.map(e => e.price));
    return `A partir de R$ ${lowestPrice.toFixed(2).replace('.', ',')}`;
}

function displayBooks() {
    bookTableBody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-4"><img src="${book.coverImage}" alt="Capa" class="w-12 h-16 object-cover rounded-md"></td>
            <td class="p-4 text-gray-800 font-medium">${book.title}</td>
            <td class="p-4 text-gray-600">${book.category}</td>
            <td class="p-4 text-gray-600">${formatPriceForDisplay(book)}</td>
            <td class="p-4 text-gray-500 font-medium">N/D</td>
            <td class="p-4 space-x-2">
                <button class="text-blue-600 hover:underline edit-btn" data-id="${book.id}">Editar</button>
                <button class="text-red-600 hover:underline delete-btn" data-id="${book.id}">Excluir</button>
            </td>
        `;
        bookTableBody.appendChild(row);
    });
}

function fillFormForEdit(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    bookForm.title.value = book.title;
    bookForm.author.value = book.author;
    bookForm.price.value = book.editions[0]?.price.toFixed(2).replace('.', ',') || '0,00';
    bookForm.stock.value = 0;
    bookForm.category.value = book.category;
    bookForm.description.value = book.description;
    bookForm.imageUrl.value = book.coverImage;
    
    editIdInput.value = book.id;
    modalTitle.textContent = 'Editar Livro';
}

function handleOpenAddModal() {
    bookForm.reset();
    
    editIdInput.value = '';
    
    modalTitle.textContent = 'Adicionar Novo Livro';

    bookModal.classList.remove('hidden');
    bookModal.classList.add('flex');
    bookModal.classList.add('opacity-100'); 
}

function handleCloseModal() {
    bookModal.classList.add('hidden');
    bookModal.classList.remove('flex');
    bookModal.classList.remove('opacity-100'); 
}

function handleFormSubmit(event) {
    event.preventDefault();

    const editingId = parseInt(editIdInput.value, 10);
    const priceValue = parseFloat(bookForm.price.value.replace('R$', '').replace(',', '.')) || 0;

    if (editingId) {
        const bookToUpdate = books.find(b => b.id === editingId);
        if (bookToUpdate) {
            Object.assign(bookToUpdate, {
                title: bookForm.title.value,
                author: bookForm.author.value,
                category: bookForm.category.value,
                description: bookForm.description.value,
                coverImage: bookForm.imageUrl.value,
            });
            if (bookToUpdate.editions.length > 0) {
                bookToUpdate.editions[0].price = priceValue;
            } else {
                bookToUpdate.editions.push({ format: 'Capa Comum', price: priceValue });
            }
        }
    } else {
        const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
        const newBook = {
            id: newId,
            title: bookForm.title.value,
            author: bookForm.author.value,
            category: bookForm.category.value,
            description: bookForm.description.value,
            coverImage: bookForm.imageUrl.value,
            rating: 0,
            language: 'Português',
            editions: [{ format: 'Capa Comum', price: priceValue }]
        };
        books.push(newBook);
    }

    displayBooks();
    handleCloseModal();
}

function handleTableActions(event) {
    const target = event.target;
    const bookId = parseInt(target.dataset.id, 10);

    if (target.classList.contains('edit-btn')) {
        fillFormForEdit(bookId);
        bookModal.classList.remove('hidden');
        bookModal.classList.add('flex');
        bookModal.classList.add('opacity-100');
    }

    if (target.classList.contains('delete-btn')) {
        const bookToDelete = books.find(b => b.id === bookId);
        if (confirm(`Tem certeza que deseja excluir o livro "${bookToDelete?.title}"?`)) {
            books = books.filter(b => b.id !== bookId);
            displayBooks();
        }
    }
}

function initializeApp() {
    addBookBtn.addEventListener('click', handleOpenAddModal);
    closeModalBtn.addEventListener('click', handleCloseModal);
    bookModal.addEventListener('click', (e) => {
        if (e.target === bookModal) handleCloseModal();
    });
    bookForm.addEventListener('submit', handleFormSubmit);
    bookTableBody.addEventListener('click', handleTableActions);

    displayBooks();
}

document.addEventListener('DOMContentLoaded', () => {  
    initializeApp();
});