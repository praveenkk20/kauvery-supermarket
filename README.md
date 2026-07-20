# Kauvery Supermarket — Shopping Cart (scaffold)

This repo contains a starter scaffold for a supermarket shopping cart app.

Stack
- Backend: Node.js + Express, Sequelize (SQLite), JWT for auth, Google OAuth placeholder, phone OTP placeholders
- Frontend: Vue 3 (Vite), Redux Toolkit for state management (user requested Redux), Tailwind (CDN quick-start)

What I added in this commit
- backend/ Express app, Sequelize setup, models (User, Item), routes (auth, items, cart)
- frontend/ Vite + Vue 3 skeleton, Redux store (RTK) and example slices, simple components (Login, Shop, Cart, AdminDashboard)
- README, .env.example, .gitignore

How to run (local)
1. Backend
   - cd backend
   - cp .env.example .env and fill values (JWT_SECRET, GOOGLE_CLIENT_ID/SECRET optional)
   - npm install
   - npm run dev

2. Frontend
   - cd frontend
   - npm install
   - npm run dev

Notes
- Phone OTP flow and Google OAuth are scaffolds/placeholders. For production use, configure Twilio and Google Cloud OAuth and update callbacks.
- Redux is wired using Redux Toolkit; in Vue components you can import the store and dispatch/select directly.
