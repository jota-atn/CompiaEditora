import express from "express";
import path from "path";
import { fileURLToPath } from "url";
// Importa o DB e a função createTables
import db, { createTables } from "./src/database/database.js";
// Importa a função de seed
import { seedDatabase } from "./src/database/booksSeed.js";

import cors from 'cors'; // Para permitir acesso de outros domínios
import bodyParser from 'body-parser'; // Para entender o JSON enviado pelo front
import booksRouter from './src/routes/books.js'; // Suas rotas de API

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors()); // Habilita o CORS
app.use(express.json()); // Habilita o Express a ler JSON

// Servir arquivos estáticos (HTML, CSS, JS do front)
app.use(express.static(path.join(__dirname, "public")));

// booksRouter irá gerenciar as requisições para /api/books
app.use('/api/books', booksRouter);

// Função para iniciar o servidor
function startServer() {
  console.log('Iniciando servidor...');
  
  // 1. Garante que as tabelas existam (só cria se não existirem)
  createTables(() => {
    console.log('Verificação de tabelas concluída.');

    // 2. Verifica se o banco já está populado
    db.get("SELECT COUNT(*) as count FROM books", (err, row) => {
      if (err) {
        console.error("Erro ao verificar contagem de livros:", err);
        return;
      }

      // 3. Se o banco estiver vazio (count === 0), popule-o
      if (row.count === 0) {
        console.log("Banco de dados vazio. Iniciando 'seed'...");
        seedDatabase(() => {
          // 4. Após popular, inicie o servidor
          console.log("Seed concluído.");
          app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
          });
        });
      } else {
        // 4. Se o banco NÃO estiver vazio, apenas inicie o servidor
        console.log(`Banco de dados já populado com ${row.count} livros.`);
        app.listen(PORT, () => {
          console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
      }
    });
  });
}

// Chame a função principal para iniciar o processo
startServer();