const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./db');

dotenv.config();

const app = express();

const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json());

// routes
app.use('/auth', require('./routes/auth'));
app.use('/items', require('./routes/items'));
app.use('/cart', require('./routes/cart'));

app.get('/', (req, res) => res.json({ ok: true, message: 'Kauvery Supermarket API' }));

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
})();

module.exports = app;
