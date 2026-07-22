const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const sequelize = require('./db');

dotenv.config();

const fileUpload = require('express-fileupload');
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
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
app.use('/auth', require('./routes/auth'));
app.use('/items', require('./routes/items'));
app.use('/cart', require('./routes/cart'));
app.use('/orders', require('./routes/orders'));
app.use('/users', require('./routes/users'));
app.use('/categories', require('./routes/categories'));
app.use('/reviews', require('./routes/reviews'));

app.get('/', (req, res) => res.json({ ok: true, message: 'Kauvery Supermarket API' }));

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    const dbPath = path.join(__dirname, 'database.sqlite');
    if (fs.existsSync(dbPath)) {
      try {
        await sequelize.sync({ alter: true });
      } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError' || err.message?.includes('UNIQUE constraint failed')) {
          console.warn('SQLite schema alter failed; recreating local database file to recover.');
          fs.renameSync(dbPath, `${dbPath}.bak`);
          await sequelize.sync({ force: true });
        } else {
          throw err;
        }
      }
    } else {
      await sequelize.sync({ force: true });
    }

    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the process using that port or set a different PORT in your environment.`);
      } else {
        console.error('Server error', err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
})();

module.exports = app;
