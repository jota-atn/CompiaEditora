import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors';

import booksRouter from './routes/books.js';
// import freteRoutes from './src/routes/frete.js';
 
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors()); // Habilita o CORS
app.use(express.json()); // Habilita o Express a ler JSON

// Servir arquivos estáticos (HTML, CSS, JS do front)
app.use(express.static(path.join(__dirname, '../public')));

// booksRouter irá gerenciar as requisições para /api/books
app.use('/api/books', booksRouter);
// app.use('/api/frete', freteRoutes);//Descomentar quando pronto

// Exporta o app para o server.js usar
export default app;