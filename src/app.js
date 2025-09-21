const express = require('express');
const path = require('path');

const booksRoutes = require('./routes/books.js');
const freteRoutes = require('./routes/frete.js');

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.use('/api/books', booksRoutes);
app.use('/api/frete', freteRoutes)

module.exports = app;