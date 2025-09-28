import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors';

import booksRouter from './routes/books.js';
import freteRoutes from './routes/frete.js';
import cepRoutes from './routes/cep.js'
import pagamentoRoutes from './routes/pagamento.js'
import userRouter from './routes/users.js';
import addressRouter from './routes/address.js';
import orderRouter from './routes/orders.js';
 
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors()); // Habilita o CORS
app.use(express.json()); // Habilita o Express a ler JSON

// Servir arquivos estáticos (HTML, CSS, JS do front)
app.use(express.static(path.join(__dirname, '../public')));

// routes para gerenciar as requisições paras api
app.use('/api/books', booksRouter);
app.use('/api/frete', freteRoutes);
app.use('/api/cep', cepRoutes);
app.use('/api/pagamento', pagamentoRoutes);
app.use('/api/users', userRouter);
app.use('/api/addresses', addressRouter);
app.use('/api/orders', orderRouter);

// Exporta o app para o server.js usar
export default app;
