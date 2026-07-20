const readline = require('readline');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const sequelize = require('./db');
const User = require('./models/user');

dotenv.config();

const argv = require('node:process').argv.slice(2);
const args = argv.reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  if (key && value) {
    acc[key.replace(/^--/, '')] = value;
  }
  return acc;
}, {});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  try {
    await sequelize.authenticate();

    const name = args.name || (await question('Admin name: '));
    const email = args.email || (await question('Admin email: '));
    const password = args.password || (await question('Admin password: '));
    const phone = args.phone || (await question('Phone (optional): '));
    const adminSecret = args.adminSecret || process.env.ADMIN_SECRET;

    if (!adminSecret) {
      console.error('ADMIN_SECRET is required. Pass --adminSecret=VALUE or set ADMIN_SECRET in .env.');
      process.exit(1);
    }

    if (!email || !password) {
      console.error('Email and password are required.');
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || null,
      email,
      passwordHash,
      phone: phone || null,
      isAdmin: true,
    });

    console.log(`Admin created successfully with id=${user.id} and email=${user.email}`);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.error('A user with that email already exists.');
    } else {
      console.error('Failed to create admin:', err.message || err);
    }
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

main();
