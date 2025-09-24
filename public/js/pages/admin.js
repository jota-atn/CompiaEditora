let allBooks = []; 

//TIREM/AJEITEM DEPOIS ADIEL OU TONY ISSO É SÓ PRA >>TESTAR!!!!<<
let allOrders = [
    { id: "7C4A1B", customerName: "Ana Silva", date: "22/09/2025", total: "R$ 129,90", status: "Entregue" },
    { id: "8D9F2C", customerName: "Bruno Costa", date: "23/09/2025", total: "R$ 139,80", status: "Processando" }
];
let allUsers = [
    { id: 101, name: "Ana Silva", email: "ana.silva@email.com", joinDate: "15/01/2025" },
    { id: 102, name: "Bruno Costa", email: "bruno.costa@email.com", joinDate: "28/03/2025" }
];

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toast.className = `p-4 rounded-lg shadow-lg text-white font-semibold transform transition-all duration-300 ease-out ${bgColor} translate-y-4 opacity-0`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    }, 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 4000);
}

function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('modal-active'), 10);
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('modal-active');
    modal.addEventListener('transitionend', () => {
        modal.classList.add('hidden');
    }, { once: true });
}

function renderDashboard() {
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;
    statsContainer.innerHTML = `
        <div class="p-6 bg-white rounded-lg shadow-md"><h3 class="text-gray-500">Total de Produtos</h3><p class="text-3xl font-bold text-gray-800">${allBooks.length}</p></div>
        <div class="p-6 bg-white rounded-lg shadow-md"><h3 class="text-gray-500">Total de Pedidos</h3><p class="text-3xl font-bold text-gray-800">${allOrders.length}</p></div>
        <div class="p-6 bg-white rounded-lg shadow-md"><h3 class="text-gray-500">Total de Usuários</h3><p class="text-3xl font-bold text-gray-800">${allUsers.length}</p></div>
        <div class="p-6 bg-white rounded-lg shadow-md"><h3 class="text-gray-500">Receita (Simulado)</h3><p class="text-3xl font-bold text-gray-800">R$ 1.250,00</p></div>
    `;
}

function renderProductsTable() {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;
    if (allBooks.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhum livro encontrado.</td></tr>`;
        return;
    }
    tableBody.innerHTML = allBooks.map(book => {
        const price = book.editions[0]?.price?.toFixed(2) || 'N/A';
        return `
            <tr>
                <td class="p-4"><img src="${book.coverImage}" alt="${book.title}" class="w-12 h-16 object-cover rounded-md"></td>
                <td class="p-4 font-medium text-gray-800">${book.title}</td>
                <td class="p-4 text-gray-600">${book.category}</td>
                <td class="p-4 text-gray-600">R$ ${price}</td>
                <td class="p-4 space-x-2 whitespace-nowrap">
                    <button class="text-blue-600 hover:underline btn-edit" data-id="${book.id}">Editar</button>
                    <button class="text-red-600 hover:underline btn-delete" data-id="${book.id}">Excluir</button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderOrdersTable() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = allOrders.map(order => `
        <tr>
            <td class="p-4 font-mono text-gray-600">#${order.id}</td>
            <td class="p-4 font-medium text-gray-800">${order.customerName}</td>
            <td class="p-4 text-gray-600">${order.date}</td>
            <td class="p-4 text-gray-600">${order.total}</td>
            <td class="p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Entregue' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${order.status}</span></td>
        </tr>
    `).join('');
}

function renderUsersTable() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = allUsers.map(user => `
        <tr>
            <td class="p-4 font-mono text-gray-600">${user.id}</td>
            <td class="p-4 font-medium text-gray-800">${user.name}</td>
            <td class="p-4 text-gray-600">${user.email}</td>
            <td class="p-4 text-gray-600">${user.joinDate}</td>
        </tr>
    `).join('');
}

async function loadBooks() {
    const tableBody = document.getElementById('products-table-body');
    try {
        const response = await fetch('/api/books');
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        const booksFromAPI = await response.json();
        allBooks = booksFromAPI;
        renderProductsTable();
        renderDashboard();
    } catch (error) {
        console.error("Falha ao carregar livros:", error);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500">Não foi possível carregar os livros. Verifique se o servidor está rodando.</td></tr>`;
        }
    }
}

async function deleteBook(id) {
    try {
        const response = await fetch(`/api/books/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Falha ao excluir o livro.');
        }
        showToast('Livro excluído com sucesso!', 'success');
        loadBooks();
    } catch (error) {
        console.error('Erro ao excluir livro:', error);
        showToast(error.message, 'error');
    }
}

async function saveBook(bookData, id) {
    const isEditing = !!id;
    const url = isEditing ? `/api/books/${id}` : '/api/books';
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData),
        });
        if (!response.ok) {
            throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'adicionar'} o livro.`);
        }
        showToast(`Livro ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`, 'success');
        closeModal(document.getElementById('book-modal'));
        loadBooks();
    } catch (error) {
        console.error('Erro ao salvar livro:', error);
        showToast(error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('#admin-nav .nav-item');
    const views = document.querySelectorAll('.admin-view');
    const bookModal = document.getElementById('book-modal');
    const bookForm = document.getElementById('book-form');
    let currentEditingId = null;

    function switchView(viewId) {
        views.forEach(view => view.classList.add('hidden'));
        navLinks.forEach(link => link.classList.remove('bg-gray-900', 'text-white'));

        const activeView = document.getElementById(`${viewId}-view`);
        const activeLink = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        
        if (activeView) activeView.classList.remove('hidden');
        if (activeLink) activeLink.classList.add('bg-gray-900', 'text-white');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(link.dataset.view);
        });
    });

    document.getElementById('add-book-btn').addEventListener('click', () => {
        currentEditingId = null;
        document.getElementById('modal-title').textContent = 'Adicionar Novo Livro';
        bookForm.reset();
        openModal(bookModal);
    });

    document.querySelectorAll('.modal-close, .modal-cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => closeModal(bookModal));
    });
    
    document.getElementById('products-table-body').addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir este livro?')) {
                deleteBook(id);
            }
        }
        if (target.classList.contains('btn-edit')) {
            const book = allBooks.find(b => b.id == id);
            if(book) {
                currentEditingId = id;
                document.getElementById('modal-title').textContent = 'Editar Livro';
                document.getElementById('book-id').value = book.id;
                document.getElementById('title').value = book.title;
                document.getElementById('price').value = book.editions[0]?.price?.toFixed(2).replace('.', ',') || '';
                document.getElementById('category').value = book.category;
                document.getElementById('description').value = book.description;
                document.getElementById('coverImage').value = book.coverImage;
                openModal(bookModal);
            }
        }
    });

    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const bookData = {
            title: document.getElementById('title').value,
            coverImage: document.getElementById('coverImage').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            author: "Admin",
            rating: 0,
            language: "Português",
            editions: [{ 
                format: "Capa Comum",
                price: parseFloat(document.getElementById('price').value.replace('R$ ', '').replace(',', '.'))
            }]
        };
        saveBook(bookData, currentEditingId);
    });

    renderOrdersTable();
    renderUsersTable();
    loadBooks(); 
    
    switchView('dashboard');
});