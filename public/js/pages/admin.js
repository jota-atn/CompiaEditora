let allBooks = []; 

//TIREM/AJEITEM DEPOIS ADIEL OU TONY ISSO É SÓ PRA >>TESTAR!!!!<<
let allOrders = [
    { id: "7C4A1B", customerName: "Ana Silva", date: "2025-09-22", address: "Rua A, 123, João Pessoa", items: [{ title: "Livro X", qty: 1, price: 129.9 }], total: 129.9, status: "Entregue" },
    { id: "8D9F2C", customerName: "Bruno Costa", date: "2025-09-23", address: "Av B, 45, Campina Grande", items: [{ title: "Livro Y", qty: 2, price: 69.9 }], total: 139.8, status: "Processando" }
];
let allUsers = [
    { id: 101, name: "Ana Silva", email: "ana.silva@email.com", joinDate: "2025-01-15", role: "Cliente" },
    { id: 102, name: "Bruno Costa", email: "bruno.costa@email.com", joinDate: "2025-03-28", role: "Cliente" }
];

let allCategories = ["Inteligência Artificial", "Programação", "Cibersegurança", "Redes", "Hardware"];
let salesChart = null;
let categoriesChart = null;

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toast.className = `p-3 rounded-lg shadow-lg text-white font-semibold ${bg} transform transition-all duration-300`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('opacity-0', 'translate-x-full'), 3500);
    toast.addEventListener('transitionend', () => toast.remove());
}

function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('modal-active'), 10);
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('modal-active');
    modal.addEventListener('transitionend', () => modal.classList.add('hidden'), { once: true });
}

function renderDashboard() {
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;
    statsContainer.innerHTML = `
        <div class="p-6 bg-white rounded-lg shadow-md">
            <h3 class="text-gray-500">Total de Produtos</h3>
            <p class="text-3xl font-bold text-gray-800">${allBooks.length}</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-md">
            <h3 class="text-gray-500">Total de Pedidos</h3>
            <p class="text-3xl font-bold text-gray-800">${allOrders.length}</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-md">
            <h3 class="text-gray-500">Total de Usuários</h3>
            <p class="text-3xl font-bold text-gray-800">${allUsers.length}</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-md">
            <h3 class="text-gray-500">Receita (Simulado)</h3>
            <p class="text-3xl font-bold text-gray-800">R$ ${calculateRevenue().toFixed(2)}</p>
        </div>
    `;
    renderSalesChart();
    renderCategoriesChart();
}

function calculateRevenue() {
    return allOrders.reduce((s, o) => s + (typeof o.total === 'number' ? o.total : parseFloat(o.total || 0)), 0);
}

function renderSalesChart() {
    const ctx = document.getElementById('sales-chart');
    if (!ctx) return;
    const labels = allOrders.map(o => o.date);
    const data = allOrders.map(o => Number(o.total || 0));
    if (salesChart) salesChart.destroy();
    salesChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Vendas', data, fill: true }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

function renderCategoriesChart() {
    const ctx = document.getElementById('categories-chart');
    if (!ctx) return;
    const counts = {};
    allBooks.forEach(b => counts[b.category] = (counts[b.category] || 0) + 1);
    const labels = Object.keys(counts).length ? Object.keys(counts) : allCategories.slice(0, 4);
    const data = Object.keys(counts).length ? Object.values(counts) : [1,1,1,1];
    if (categoriesChart) categoriesChart.destroy();
    categoriesChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Livros', data }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

function renderProductsTable() {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;
    if (allBooks.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhum livro encontrado.</td></tr>`;
        return;
    }
    tableBody.innerHTML = allBooks.map(book => {
        const price = book.editions?.[0]?.price ? book.editions[0].price.toFixed(2) : 'N/A';
        const cover = book.coverImage || 'https://via.placeholder.com/80x120?text=No+Image';
        return `
            <tr class="border-t">
                <td class="p-4 align-top"><img src="${cover}" alt="${book.title}" class="w-12 h-16 object-cover rounded-md"></td>
                <td class="p-4 align-top font-medium text-gray-800">${book.title}</td>
                <td class="p-4 align-top text-gray-600">${book.category}</td>
                <td class="p-4 align-top text-gray-600">R$ ${price}</td>
                <td class="p-4 align-top space-x-2 whitespace-nowrap">
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
    if (allOrders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhum pedido encontrado.</td></tr>`;
        return;
    }
    tableBody.innerHTML = allOrders.map(order => `
        <tr class="cursor-pointer hover:bg-gray-50 order-row" data-id="${order.id}">
            <td class="p-4">${order.id}</td>
            <td class="p-4">${order.customerName}</td>
            <td class="p-4">${order.date}</td>
            <td class="p-4">R$ ${Number(order.total).toFixed(2)}</td>
            <td class="p-4">${order.status}</td>
        </tr>
    `).join('');
}

function renderUsersTable() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;
    if (allUsers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhum usuário cadastrado.</td></tr>`;
        return;
    }
    tableBody.innerHTML = allUsers.map(u => `
        <tr class="border-t">
            <td class="p-4">${u.id}</td>
            <td class="p-4 font-medium">${u.name}</td>
            <td class="p-4">${u.email}</td>
            <td class="p-4">${u.joinDate}</td>
            <td class="p-4 whitespace-nowrap">
                <button class="text-indigo-600 hover:underline btn-user-edit" data-id="${u.id}">Editar</button>
                <button class="text-red-600 hover:underline btn-user-delete" data-id="${u.id}">Excluir</button>
            </td>
        </tr>
    `).join('');
}

function renderCategoriesTable() {
    const tableBody = document.getElementById('categories-table-body');
    if (!tableBody) return;
    if (allCategories.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-gray-500">Nenhuma categoria.</td></tr>`;
        return;
    }
    tableBody.innerHTML = allCategories.map((c, i) => `
        <tr class="border-t">
            <td class="p-4">${i + 1}</td>
            <td class="p-4 font-medium">${c}</td>
            <td class="p-4 whitespace-nowrap">
                <button class="text-indigo-600 hover:underline btn-category-edit" data-id="${i}">Editar</button>
                <button class="text-red-600 hover:underline btn-category-delete" data-id="${i}">Excluir</button>
            </td>
        </tr>
    `).join('');
}

async function loadData() {
    await loadBooks();
}

async function loadBooks() {
    try {
        const res = await fetch('/api/books');
        if (!res.ok) throw new Error('API não disponível');
        allBooks = await res.json();
    } catch {
        allBooks = []; // fallback
    }
}

function saveBook(bookData, id) {
    if (id) {
        const idx = allBooks.findIndex(b => b.id == id);
        if (idx > -1) {
            allBooks[idx] = { ...allBooks[idx], ...bookData, editions: bookData.editions || allBooks[idx].editions };
            showToast('Livro atualizado');
        }
    } else {
        const newBook = { ...bookData, id: Date.now().toString(), editions: bookData.editions || [{ price: parseFloat(bookData.editions?.[0]?.price || 0) }] };
        allBooks.push(newBook);
        showToast('Livro adicionado');
    }
    renderProductsTable();
    renderDashboard();
    renderCategoriesChart();
    closeModal(document.getElementById('book-modal'));
}

function deleteBook(id) {
    allBooks = allBooks.filter(b => b.id != id);
    renderProductsTable();
    renderDashboard();
    showToast('Livro excluído', 'success');
}

function addCategory(name) {
    if (!name) return;
    allCategories.push(name);
    renderCategoriesTable();
    loadCategorySelects();
    showToast('Categoria adicionada');
}

function updateCategory(index, name) {
    if (index == null || !name) return;
    allCategories[index] = name;
    renderCategoriesTable();
    loadCategorySelects();
    showToast('Categoria atualizada');
}

function deleteCategory(index) {
    allCategories.splice(index, 1);
    renderCategoriesTable();
    loadCategorySelects();
    showToast('Categoria excluída');
}

function openOrderModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    const modal = document.getElementById('order-modal');
    const container = document.getElementById('order-details');
    container.innerHTML = `
        <div class="space-y-2">
            <div><strong>ID:</strong> ${order.id}</div>
            <div><strong>Cliente:</strong> ${order.customerName}</div>
            <div><strong>Data:</strong> ${order.date}</div>
            <div><strong>Endereço:</strong> ${order.address}</div>
            <div><strong>Status:</strong>
                <select id="order-status-select" class="mt-1 block rounded-md border px-3 py-2">
                    <option ${order.status === 'Processando' ? 'selected' : ''}>Processando</option>
                    <option ${order.status === 'Em Rota' ? 'selected' : ''}>Em Rota</option>
                    <option ${order.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                    <option ${order.status === 'Entregue' ? 'selected' : ''}>Entregue</option>
                    <option ${order.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </div>
            <div><strong>Itens:</strong>
                <ul class="list-disc ml-6 mt-2">${order.items.map(it => `<li>${it.title} — ${it.qty} x R$ ${Number(it.price).toFixed(2)}</li>`).join('')}</ul>
            </div>
            <div><strong>Total:</strong> R$ ${Number(order.total).toFixed(2)}</div>
        </div>
    `;
    openModal(modal);
    const statusSelect = document.getElementById('order-status-select');
    statusSelect.addEventListener('change', (e) => {
        order.status = e.target.value;
        renderOrdersTable();
        renderDashboard();
        showToast('Status do pedido atualizado');
    }, { once: true });
}

function openUserModal(userId) {
    const user = allUsers.find(u => u.id == userId);
    if (!user) return;
    const modal = document.getElementById('user-modal');
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-role').value = user.role || 'Cliente';
    openModal(modal);
}

function saveUser(formData) {
    const id = Number(formData.get('user-id'));
    const name = formData.get('user-name');
    const email = formData.get('user-email');
    const role = formData.get('user-role');
    const idx = allUsers.findIndex(u => u.id === id);
    if (idx > -1) {
        allUsers[idx] = { ...allUsers[idx], name, email, role };
        showToast('Usuário atualizado');
    }
    renderUsersTable();
    closeModal(document.getElementById('user-modal'));
}

function deleteUser(id) {
    allUsers = allUsers.filter(u => u.id != id);
    renderUsersTable();
    showToast('Usuário excluído', 'success');
}

function loadCategorySelects() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return;
    categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    allCategories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c; opt.textContent = c;
        categorySelect.appendChild(opt);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const navLinks = document.querySelectorAll('#admin-nav .nav-item');
    const views = document.querySelectorAll('.admin-view');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const desktopCollapseBtn = document.getElementById('desktop-collapse-btn');

    function switchView(viewId) {
        views.forEach(v => v.classList.add('hidden'));
        navLinks.forEach(l => l.classList.remove('active'));
        const activeView = document.getElementById(`${viewId}-view`);
        const activeLink = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (activeView) activeView.classList.remove('hidden');
        if (activeLink) activeLink.classList.add('active');
        if (window.innerWidth < 768) sidebar.classList.add('-translate-x-full');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(link.dataset.view);
        });
    });

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));
    }

    if (desktopCollapseBtn) {
        desktopCollapseBtn.classList.remove('hidden');
        desktopCollapseBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    await loadData();
    loadCategorySelects();
    renderDashboard();
    renderProductsTable();
    renderOrdersTable();
    renderUsersTable();
    renderCategoriesTable();
    switchView('dashboard');

    const addBookBtn = document.getElementById('add-book-btn');
    const bookModal = document.getElementById('book-modal');
    const bookForm = document.getElementById('book-form');
    let currentEditingId = null;

    addBookBtn.addEventListener('click', () => {
        currentEditingId = null;
        document.getElementById('modal-title').textContent = 'Adicionar Novo Livro';
        bookForm.reset();
        openModal(bookModal);
    });

    document.querySelectorAll('.modal-close, .modal-cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const m = e.target.closest('.modal-overlay');
            if (m) closeModal(m);
        });
    });

    document.getElementById('products-table-body').addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir este livro?')) deleteBook(id);
        }
        if (target.classList.contains('btn-edit')) {
            const book = allBooks.find(b => b.id == id);
            if (book) {
                currentEditingId = id;
                document.getElementById('modal-title').textContent = 'Editar Livro';
                document.getElementById('book-id').value = book.id;
                document.getElementById('title').value = book.title || '';
                document.getElementById('price').value = book.editions?.[0]?.price ? book.editions[0].price.toFixed(2).replace('.', ',') : '';
                document.getElementById('category').value = book.category || '';
                document.getElementById('description').value = book.description || '';
                document.getElementById('coverImage').value = book.coverImage || '';
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
                price: parseFloat(document.getElementById('price').value.replace('R$ ', '').replace(',', '.')) || 0
            }]
        };
        saveBook(bookData, currentEditingId);
    });

    document.getElementById('orders-table-body').addEventListener('click', (e) => {
        const row = e.target.closest('.order-row');
        if (!row) return;
        openOrderModal(row.dataset.id);
    });

    document.getElementById('users-table-body').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('btn-user-edit')) {
            openUserModal(target.dataset.id);
        }
        if (target.classList.contains('btn-user-delete')) {
            if (confirm('Deseja excluir este usuário?')) deleteUser(target.dataset.id);
        }
    });

    const userForm = document.getElementById('user-form');
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(userForm);
        saveUser(fd);
    });

    const addCategoryBtn = document.getElementById('add-category-btn');
    const categoryModal = document.getElementById('category-modal');
    const categoryForm = document.getElementById('category-form');
    let editingCategoryIndex = null;

    addCategoryBtn.addEventListener('click', () => {
        editingCategoryIndex = null;
        document.getElementById('category-name').value = '';
        openModal(categoryModal);
    });

    document.getElementById('categories-table-body').addEventListener('click', (e) => {
        const target = e.target;
        const idx = target.dataset.id;
        if (target.classList.contains('btn-category-edit')) {
            editingCategoryIndex = Number(idx);
            document.getElementById('category-name').value = allCategories[editingCategoryIndex];
            openModal(categoryModal);
        }
        if (target.classList.contains('btn-category-delete')) {
            if (confirm('Excluir categoria?')) deleteCategory(Number(idx));
        }
    });

    categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('category-name').value.trim();
        if (!name) return;
        if (editingCategoryIndex == null) addCategory(name);
        else updateCategory(editingCategoryIndex, name);
        closeModal(categoryModal);
    });
});
