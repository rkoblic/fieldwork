require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes
const pagesRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');

app.use('/api', apiRoutes);
app.use('/', pagesRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`FieldWork running at http://localhost:${PORT}`);
});

module.exports = app;
