let allBooks = [];
let allOrders = [];
let allUsers = [];

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

function formatCPF(cpf) {
    if (!cpf || cpf.length !== 11) return "CPF Inválido";
    // Formata para 123.***.***-45
    return `${cpf.substring(0, 3)}.***.***-${cpf.substring(9, 11)}`;
}

function renderOrdersTable() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    if (allOrders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhum pedido encontrado.</td></tr>`;
        return;
    }

    tableBody.innerHTML = allOrders.map(order => `
        <tr>
            <td class="p-4 font-medium text-gray-800">#${order.id}</td>
            <td class="p-4 text-gray-600">${order.userName || 'Usuário Deletado'}</td>
            <td class="p-4 text-gray-600">${new Date(order.order_date).toLocaleDateString('pt-BR')}</td>
            <td class="p-4 font-medium text-gray-800">R$ ${order.total_price.toFixed(2).replace('.', ',')}</td>
            <td class="p-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    ${order.status}
                </span>
            </td>
        </tr>
    `).join('');
}

function renderUsersTable() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;
    
    if (allUsers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>`;
        return;
    }

    tableBody.innerHTML = allUsers.map(user => `
        <tr>
            <td class="p-4 font-medium text-gray-800">${user.id}</td>
            <td class="p-4 text-gray-600">${user.name}</td>
            <td class="p-4 text-gray-600">${user.email}</td>
            <td class="p-4 text-gray-600">${formatCPF(user.cpf)}</td>
        </tr>
    `).join('');
}

async function loadOrders() {
    try {
        const token = localStorage.getItem('authToken');
        
        const response = await fetch('/api/orders/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Falha ao carregar pedidos.');
        allOrders = await response.json();
    } catch (error) {
        console.error("Falha ao carregar pedidos:", error);
        showToast("Não foi possível carregar os pedidos.", "error");
    }
}


async function loadUsers() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/users/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao carregar usuários.');
        allUsers = await response.json();
    } catch (error) {
        console.error("Falha ao carregar usuários:", error);
        showToast("Não foi possível carregar os usuários.", "error");
    }
}

async function loadData() {
    // Usamos Promise.all para carregar tudo em paralelo
    await Promise.all([
        loadBooks(),
        loadOrders(),
        loadUsers()
    ]);
}


async function loadBooks() {
    try {
        const response = await fetch('/api/books');
        if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
        allBooks = await response.json();
    } catch (error) {
        console.error("Falha ao carregar livros:", error);
        showToast("Não foi possível carregar os produtos.", "error");
    }
}

async function loadCategories() {
    const categorySelect = document.getElementById('category');
    try {
        // const response = await fetch('/api/categories');
        // if (!response.ok) throw new Error('Falha ao carregar categorias');
        // const categories = await response.json();
        const categories = ["Inteligência Artificial", "Programação", "Cibersegurança", "Redes", "Hardware"]; // Simulado por enquanto
        
        categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        categorySelect.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

async function saveBook(bookData, id) {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/books/${id}` : '/api/books';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Falha ao ${id ? 'atualizar' : 'salvar'} o livro.`);
        }
        
        showToast(`Livro ${id ? 'atualizado' : 'salvo'} com sucesso!`, 'success');
        closeModal(document.getElementById('book-modal'));
        await loadBooks(); 

    } catch (error) {
        console.error(`Erro ao salvar livro:`, error);
        showToast(error.message, 'error');
    }
}

async function deleteBook(id) {
    try {
        const response = await fetch(`/api/books/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Falha ao deletar o livro.');
        }

        showToast('Livro deletado com sucesso!', 'success');
        await loadBooks();

    } catch (error) {
        console.error('Erro ao deletar livro:', error);
        showToast(error.message, 'error');
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    const navLinks = document.querySelectorAll('#admin-nav .nav-item');
    const views = document.querySelectorAll('.admin-view');
    const bookModal = document.getElementById('book-modal');
    const bookForm = document.getElementById('book-form');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    let currentEditingId = null;

    function switchView(viewId) {
        views.forEach(view => view.classList.add('hidden'));
        navLinks.forEach(link => link.classList.remove('active'));

        const activeView = document.getElementById(`${viewId}-view`);
        const activeLink = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        
        if (activeView) activeView.classList.remove('hidden');
        if (activeLink) activeLink.classList.add('active');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(link.dataset.view);
            if (window.innerWidth < 768) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    });
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

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
    
    await loadData();
    await loadCategories();

    renderDashboard();
    renderProductsTable();
    renderOrdersTable();
    renderUsersTable();
    
    switchView('dashboard');
});