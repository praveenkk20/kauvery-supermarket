<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">Kauvery Supermarket</div>
      <nav class="nav-links">
        <router-link to="/" class="nav-link">Shop</router-link>
        <router-link to="/cart" class="nav-link">Cart</router-link>
        <router-link v-if="!auth.token" to="/login" class="nav-link action">Login</router-link>
        <button v-else type="button" class="nav-link action" @click="logout">Logout</button>
      </nav>
    </header>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script>
import store, { clearAuth } from './store/reduxStore';

export default {
  name: 'App',
  data() {
    return {
      auth: store.getState().auth
    };
  },
  created() {
    this.unsubscribe = store.subscribe(() => {
      this.auth = store.getState().auth;
    });
  },
  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  },
  methods: {
    logout() {
      store.dispatch(clearAuth());
      this.$router.push('/login');
    }
  }
};
</script>

<style>
.app-shell {
  min-height: 100vh;
  background: #f7f8fb;
  color: #1f2937;
  font-family: Arial, sans-serif;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #0f172a;
  color: white;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.12);
}
.brand {
  font-size: 1.5rem;
  font-weight: 700;
}
.nav-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.nav-link {
  color: #dbeafe;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 8px;
  transition: background 0.2s ease;
  border: none;
  cursor: pointer;
  background: transparent;
}
.nav-link:hover {
  background: rgba(219, 234, 254, 0.2);
}
.nav-link.action {
  background: #38bdf8;
  color: #0f172a;
}
.content {
  max-width: 1080px;
  margin: 24px auto;
  padding: 0 16px 24px;
}
</style>
