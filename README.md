

# CompiaEditora

Projeto da disciplina **Programação para Web I**

---

## 📚 Sobre o Projeto

CompiaEditora é um site fictício desenvolvido como atividade da disciplina de Programação para Web I.
O objetivo é praticar a construção de uma aplicação web full-stack com Node.js, simulando as funcionalidades de uma editora virtual, como catálogo, autenticação de usuários, busca, cálculo de frete e checkout com pagamento.

---

## 🛠 Tecnologias

-   HTML
-   CSS
-   JavaScript
-   Node.JS
-   Express
-   SQLite
-   JSONWebToken (JWT) para autenticação
-   Faker.js para popular o banco de dados
-   Melhor Envio API para cálculo de frete
-   Abacate Pay API para simulação de pagamentos

---

## 🏛️ Estrutura do Projeto

Este projeto adota uma arquitetura organizada para separar as responsabilidades do Back-end e do Front-end, seguindo as melhores práticas de desenvolvimento com Node.js e Express, facilitando a manutenção e a escalabilidade.

```
/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── images/
│   │   └── default-profile.png
│   ├── js/
│   │   ├── pages/
│   │   │   ├── admin.js
│   │   │   ├── busca.js
│   │   │   ├── catalog.js
│   │   │   ├── categories.js
│   │   │   ├── checkout.js
│   │   │   ├── home.js
│   │   │   └── perfil.js
│   │   ├── services/
│   │   │   ├── addressService.js
│   │   │   ├── cepService.js
│   │   │   ├── freteService.js
│   │   │   ├── orderService.js
│   │   │   ├── pagamentoService.js
│   │   │   └── userService.js
│   │   ├── auth.js
│   │   ├── bookService.js
│   │   ├── cart.js
│   │   ├── icons.js
│   │   └── ui.js
│   ├── admin.html
│   ├── busca.html
│   ├── cadastro.html
│   ├── catalogo.html
│   ├── categorias.html
│   ├── checkout.html
│   ├── index.html
│   ├── login.html
│   └── perfil.html
├── src/
│   ├── controllers/
│   │   ├── addressController.js
│   │   ├── bookController.js
│   │   ├── cepController.js
│   │   ├── freteController.js
│   │   ├── orderController.js
│   │   ├── pagamentoController.js
│   │   └── userController.js
│   ├── database/
│   │   ├── booksData.js
│   │   ├── booksSeed.js
│   │   ├── database.js
│   │   └── editora.db
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── address.js
│   │   ├── books.js
│   │   ├── cep.js
│   │   ├── frete.js
│   │   ├── orders.js
│   │   ├── pagamento.js
│   │   └── users.js
│   ├── app.js
│   └── config.js
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
    -   `/css`, `/images`, `/js`: Contêm os assets estáticos como folhas de estilo, imagens e scripts do lado do cliente.
    -   `/js/pages`: Contém os scripts específicos para cada página HTML, organizando a lógica de front-end.
    -   `/js/services`: Centraliza a comunicação com as APIs (back-end da aplicação, CEP, frete, etc.).
    -   Arquivos `.html`: As páginas que estruturam o site.

-   **`/src`**
    -   Contém todo o código-fonte do **Back-end** (lógica do servidor).
    -   `app.js`: Responsável por criar a instância do Express, configurar os middlewares e conectar as rotas da API.
    -   `config.js`: Armazena variáveis de configuração, como chaves de API e segredos JWT.
    -   `/controllers`: Contêm a lógica de negócio da aplicação. Cada função aqui é responsável por uma tarefa específica (ex: buscar usuário, criar pedido).
    -   `/routes`: Mapeiam as URLs e os métodos HTTP (GET, POST, etc.) para as funções correspondentes nos `controllers`. Não contêm lógica de negócio, apenas direcionam as requisições.
    -   `/database`: Responsável por toda a comunicação com o banco de dados (conectar, criar tabelas e popular dados iniciais).
    -   `/middleware`: Contém funções que processam requisições antes de chegarem aos `controllers`, como o `authMiddleware.js` que verifica a autenticação do usuário.

## 📁 Descrição dos arquivos HTML

| Arquivo/Pasta | Descrição |
| :--- | :--- |
| index.html | Página inicial |
| catalogo.html | Página com listagem de produtos/catálogo |
| categorias.html | Página de listagem por categoria |
| busca.html | Página para realizar buscas |
| checkout.html | Fluxo de finalização de compra |
| login.html | Página de login do usuário |
| cadastro.html | Página para cadastro de novos usuários |
| perfil.html | Página de perfil do usuário logado |
| admin.html | Painel de administração de conteúdo |

---

## 🚀 Como usar / rodar localmente

1.  **Clone o repositório:**
    ```sh
    git clone https://github.com/jota-atn/CompiaEditora.git
    cd CompiaEditora
    ```

2.  **Confira se tem o [_Node_](https://nodejs.org/en//) instalado:**

    ```sh
    node -v
    npm -v
    ```

3.  **Instale as dependências do projeto:**

    ```sh
    npm install
    ```

4.  **Configure as Variáveis de Ambiente:**

    Para rodar o projeto com sua total funcionalidade é necessário ter os seus próprios tokens para o pleno funcionamento das API's, token que está no .env expira, por isso é aconselhado fazer o próprio. Para isso, siga as seguintes instruções:

    1.  Acesse os sites oficiais das APIS:
        -   [Abacate Pay](https://www.abacatepay.com/)
        -   [Melhor Envio Sandbox](https://sandbox.melhorenvio.com.br/login)

    2.  Crie uma conta em cada plataforma e, em seguida, gere o seu próprio token. Lembre-se de salvar esse token em algum lugar.
        > **Observação:** Ambas as plataformas têm o modo desenvolvedor (ou sandbox), para testes, e o modo produção. Como o projeto é para fins de estudo, certifique-se que está criando as contas e gerando os tokens no **modo desenvolvedor/sandbox**.

    3.  Agora na raiz do projeto, crie um arquivo chamado `.env` e cole o seguinte conteúdo, substituindo os campos com os tokens que você gerou:

    ```env
    MELHOR_ENVIO_API_TOKEN=<COLE_SEU_TOKEN_AQUI>
    MELHOR_ENVIO_API_URL="[https://sandbox.melhorenvio.com.br](https://sandbox.melhorenvio.com.br)"
    ABACATE_PAY_API_TOKEN=<COLE_SEU_TOKEN_AQUI>
    ABACATE_PAY_API_URL="[https://api.abacatepay.com](https://api.abacatepay.com)"
    ```

5.  **Inicie o projeto:**

    ```sh
    npm start
    ```

---

## ✔ Funcionalidades implementadas

-   Sistema de autenticação de usuários (cadastro e login) com JWT.
-   Painel de administração para gerenciamento de conteúdo.
    -   **Login ADMIN:** `admin@compia.com`
    -   **Senha ADMIN:** `Admin#Compia2025`
-   Busca de produtos e filtros por categoria.
-   Livros armazenados em banco de dados SQLite.
-   Área de usuário para gerenciamento de perfil e endereços.
-   Checkout funcional com cálculo de frete e integração de pagamento.
-   Cálculo de frete em tempo real via API (Melhor Envio).
-   Integração com API de pagamentos (Abacate Pay).

---
## 📈 Pontos a Melhorar

-   **Aprimorar a Modularização e Atomicidade da Arquitetura:**
    -   Evoluir a arquitetura visando uma maior modularização, refatorando a lógica de negócio em componentes mais coesos e desacoplados. Essa abordagem eleva a manutenibilidade e, consequentemente, a segurança, ao isolar responsabilidades e facilitar auditorias de código.
    -   Garantir a atomicidade em operações críticas através da implementação de transações. Isso assegura que processos complexos (como a finalização de um pedido) sejam executados por completo ou totalmente revertidos, garantindo a consistência e integridade dos dados em qualquer circunstância.

---

## 🤝 Contribuições

Contribuições são bem-vindas!

1.  Abra uma *issue* descrevendo a proposta.
2.  Faça um *fork* do projeto.
3.  Crie uma branch para sua feature ou correção.
4.  Envie um *pull request* quando estiver pronto.

---

## 📝 Licença

WIP

---

## ⚙ Autor

-   **Anthony Willy**
-   **João Antonio**
-   **Matheus Adiel**
