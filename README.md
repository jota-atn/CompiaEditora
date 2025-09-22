# CompiaEditora

Projeto da disciplina **Programação para Web I**

---

## 📚 Sobre o Projeto

CompiaEditora é um site fictício desenvolvido como atividade da disciplina de Programação para Web I.  
O objetivo é praticar construção de páginas web estáticas com HTML, CSS e JavaScript, simulando funcionalidades comuns de uma editora virtual, como catálogo, busca e checkout.

---

## 🛠 Tecnologias

- HTML  
- CSS  
- JavaScript  

---

## 🏛️ Estrutura do Projeto

Este projeto adota uma arquitetura organizada para separar as responsabilidades do Back-end e do Front-end, seguindo as melhores práticas de desenvolvimento com Node.js e Express, facilitando a manutenção e a escalabilidade.

```
/
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
├── src/
│   ├── data/
│   │   └── booksData.js
│   ├── database/
│   │   ├── database.js
│   │   └── booksSeed.js
│   ├── controllers/
│   │   └── bookController.js
│   ├── routes/
│   │   └── books.js
│   └── app.js
├── .gitignore
├── server.js
├── package.json
└── README.md
```

### Descrição dos Diretórios

-   **`/` (Raiz)**
    -   Contém os arquivos de configuração e inicialização do projeto.
    -   `server.js`: **Ponto de Entrada.** Sua única responsabilidade é carregar a aplicação configurada (`app.js`) e iniciar o servidor.
    -   `package.json`: Gerencia todas as dependências do Node.js e os scripts do projeto.

-   **`/public`**
    -   Pasta dedicada a todos os arquivos do **Front-end**. É a única parte do projeto que o navegador do usuário acessa diretamente.
    -   `/css`: Contém as folhas de estilo (CSS).
    -   `/js`: Contém os arquivos JavaScript que rodam no cliente (navegador) para interatividade.
    -   Arquivos `.html`: As páginas que estruturam o site.

-   **`/src`**
    -   Contém todo o código-fonte do **Back-end** (lógica do servidor).
    -   `app.js`: Responsável por criar a instância do Express, configurar os middlewares (regras gerais) e conectar as rotas da API.
    -   `/controllers`: Contêm a lógica de negócio da aplicação. Cada função aqui é responsável por uma tarefa específica.
    -   `/routes`: Mapeiam as URLs e os métodos HTTP (GET, POST, etc.) para as funções correspondentes nos `controllers`. Não contêm lógica de negócio, apenas direcionam as requisições.
    -   `/database`: Responsável por toda a comunicação com o banco de dados (conectar, criar tabelas, e as funções que inserem e buscam dados).
    -   `/data`: Armazena dados estáticos, como a lista inicial de livros usada para popular o banco de dados.

## 📁 Descrição dos arquivos HTML

| Arquivo/Pasta     | Descrição                                                  |
|--------------------|------------------------------------------------------------|
| index.html         | Página inicial                                             |
| catalogo.html      | Página com listagem de produtos/catálogo                  |
| categorias.html    | Página de listagem por categoria                          |
| busca.html         | Página para realizar buscas                                |
| checkout.html      | Fluxo simulado de finalização de compra                    |

---

## 🚀 Como usar / rodar localmente

1. Faça um clone do repositório:  
   `git clone https://github.com/jota-atn/CompiaEditora.git`

2. Confira se tem o [_Node_](https://nodejs.org/en//) instalado:
```
node -v
```
```
npm -v
```

3. Instale as dependências do projeto: 
```
npm install
```

4. Popular o BD:
```
npm run seed
```

5. Inicie o projeto:
```
npm start
```

---

## ✔ Funcionalidades implementadas

- Navegação entre páginas estáticas  
- Busca simples de produtos  
- Filtros por categoria  
- Simulação de checkout (sem back-end)  

---

## 🤝 Contribuições

Contribuições são bem-vindas!  

1. Abra uma *issue* descrevendo a proposta.  
2. Faça um *fork* do projeto.  
3. Crie uma branch para sua feature ou correção.  
4. Envie um *pull request* quando estiver pronto.  

---

## 📝 Licença

WIP

---

## ⚙ Autor

- **Anthony Willy**
- **João Antonio**
- **Matheus Adiel**
