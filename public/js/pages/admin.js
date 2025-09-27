
let allBooks = [];
let currentEditingId = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. A verificação de admin 
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // Se não há info de usuário, ou se o usuário não é admin...
    if (!userInfo || !userInfo.isAdmin) {
        alert('Acesso negado. Você precisa ser um administrador.');
        // Redireciona para a página inicial
        window.location.href = '/index.html';
    } else {
        // 2. Se for admin, mostra o conteúdo da página
        document.getElementById('admin-wrapper').classList.remove('hidden');

        const addBookBtn = document.getElementById('add-book-btn');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const bookModal = document.getElementById('book-modal');
        const bookForm = document.getElementById('book-form');
        const bookTableBody = document.querySelector('tbody');
        const modalTitle = document.getElementById('modal-title');

        async function loadBooks() {
            try {
                const response = await fetch('/api/books'); 
                if (!response.ok) throw new Error(`Falha ao carregar livros: ${response.statusText}`);
                const books = await response.json();
                allBooks = books; 
                renderBookTable(books);
            } catch (error) {
                console.error('Erro detalhado ao carregar livros:', error);
                bookTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-500">Erro ao carregar livros. Tente recarregar a página.</td></tr>`;
            }
        }

        function renderBookTable(books) {
            bookTableBody.innerHTML = ''; 
            if (!books || books.length === 0) {
                bookTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">Nenhum livro cadastrado.</td></tr>`;
                return;
            }
            books.forEach(book => {
                const hasEditions = Array.isArray(book.editions) && book.editions.length > 0;
                const firstEdition = hasEditions ? book.editions[0] : {}; 
                const price = firstEdition.price ? `R$ ${firstEdition.price.toFixed(2)}` : 'N/A';
                const stock = firstEdition.stock ?? 'Infinito'; 
                const row = `<tr>
                                <td class="p-4"><img src="${book.coverImage}" alt="Capa" class="w-12 h-16 object-cover rounded-md"></td>
                                <td class="p-4 text-gray-800 font-medium">${book.title}</td>
                                <td class="p-4 text-gray-600">${book.category}</td>
                                <td class="p-4 text-gray-600">${price}</td>
                                <td class="p-4 ${stock === 'Infinito' ? 'text-gray-600' : 'text-green-600 font-semibold'}">${stock}</td>
                                <td class="p-4 space-x-2">
                                    <button class="text-blue-600 hover:underline btn-editar" data-id="${book.id}">Editar</button>
                                    <button class="text-red-600 hover:underline btn-excluir" data-id="${book.id}">Excluir</button>
                                </td>
                             </tr>`;
                bookTableBody.innerHTML += row;
            });
        }

        // --- LÓGICA DO MODAL (ADICIONAR/EDITAR) ---
        addBookBtn.addEventListener('click', () => {
            currentEditingId = null; 
            modalTitle.textContent = 'Adicionar Novo Livro'; 
            bookForm.reset(); 
            bookModal.classList.remove('hidden');
        });

        closeModalBtn.addEventListener('click', () => {
            bookModal.classList.add('hidden');
        });

        bookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const price = parseFloat(document.getElementById('price').value.replace('R$ ', '').replace(',', '.'));
            const stockInput = document.getElementById('stock');
            const category = document.getElementById('category').value;
            const description = document.getElementById('description').value;
            const coverImage = document.getElementById('coverImage').value;
            const stock = stockInput.value === '' ? null : parseInt(stockInput.value);

            const bookData = {
                title, coverImage, category, description,
                author: "Admin", rating: 0, language: "Português",
                editions: [{ format: "Capa Comum", price, stock }]
            };

            try {
                let response;
                let url;
                let method;

                if (currentEditingId) {
                    url = `/api/books/${currentEditingId}`;
                    method = 'PUT';
                    const originalBook = allBooks.find(b => b.id === Number(currentEditingId));
                    const updatedBook = {
                        ...originalBook, ...bookData,
                        editions: [{
                            ...(originalBook.editions.length ? originalBook.editions[0] : {}),
                            price: price, stock: stock
                        }]
                    };
                    response = await fetch(url, {
                        method: method, headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedBook)
                    });
                } else {
                    url = '/api/books';
                    method = 'POST';
                    response = await fetch(url, {
                        method: method, headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bookData)
                    });
                }

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || `Falha ao ${currentEditingId ? 'atualizar' : 'salvar'} o livro`);
                }

                alert(`Livro ${currentEditingId ? 'atualizado' : 'salvo'} com sucesso!`);
                bookForm.reset();
                bookModal.classList.add('hidden');
                currentEditingId = null; 
                loadBooks(); 
            } catch (error) {
                console.error(`Erro ao ${currentEditingId ? 'atualizar' : 'salvar'}:`, error);
                alert(`Erro: ${error.message}`);
            }
        });

        // --- 3. LÓGICA DE CLIQUE DA TABELA (EDITAR E EXCLUIR) ---

        // Função para deletar
        async function handleDelete(id) {
            if (!confirm('Tem certeza de que deseja excluir este livro?')) return;
        
            try {
                const response = await fetch(`/api/books/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${userInfo.token}` } // Adicione o token aqui também
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Falha ao deletar');
                }
                alert('Livro deletado com sucesso!');
                loadBooks(); 
            } catch (error) {
                alert(`Não foi possível deletar o livro: ${error.message}`);
            }
        }

        // Função para editar
        function handleEdit(id) {
            const bookToEdit = allBooks.find(b => b.id === Number(id));
            if (!bookToEdit) {
                alert('Livro não encontrado!');
                return;
            }
            currentEditingId = id; 
            modalTitle.textContent = 'Editar Livro';
            document.getElementById('title').value = bookToEdit.title;
            document.getElementById('category').value = bookToEdit.category;
            document.getElementById('description').value = bookToEdit.description;
            document.getElementById('coverImage').value = bookToEdit.coverImage;
            if (bookToEdit.editions && bookToEdit.editions.length > 0) {
                const edition = bookToEdit.editions[0];
                document.getElementById('price').value = edition.price.toFixed(2).replace('.', ',');
                document.getElementById('stock').value = edition.stock ?? 0;
            }
            bookModal.classList.remove('hidden');
        }

        // "Escutador" principal para a TABELA
        bookTableBody.addEventListener('click', (e) => {
            const target = e.target; 
            
            if (target.classList.contains('btn-excluir')) {
                const id = target.dataset.id; 
                handleDelete(id);
            }
            
            if (target.classList.contains('btn-editar')) {
                const id = target.dataset.id; 
                handleEdit(id);
            }
        });

        // --- 4. EXECUÇÃO INICIAL ---
        loadBooks();
    }
});