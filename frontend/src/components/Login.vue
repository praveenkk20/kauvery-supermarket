<template>
  <div class="page-shell">
    <div class="form-card">
      <h2>Sign in to Kauvery</h2>
      <p class="subtitle">Use your email and password to continue.</p>

      <form @submit.prevent="submit">
<div v-if="isSignup" class="field">
        <label for="name">Name</label>
        <input id="name" type="text" v-model="name" placeholder="Your full name" required />
      </div>
      <div v-if="isSignup" class="field">
        <label for="phone">Phone</label>
        <input id="phone" type="tel" v-model="phone" placeholder="Optional" />
      </div>

      <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="email" placeholder="you@example.com" required />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" type="password" v-model="password" placeholder="••••••••" required />
        </div>

        <div class="actions">
          <button type="submit" class="primary-button">{{ modeLabel }}</button>
          <button type="button" class="secondary-button" @click="toggleMode">{{ toggleText }}</button>
        </div>

        <div v-if="success" class="success-message">{{ success }}</div>
        <div v-if="error" class="error-message">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../api';
import store, { setAuth } from '../store/reduxStore';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      name: '',
      phone: '',
      isSignup: false,
      error: null,
      success: null
    };
  },
  computed: {
    modeLabel() {
      return this.isSignup ? 'Create account' : 'Login';
    },
    toggleText() {
      return this.isSignup ? 'Have an account? Login' : 'Create a new account';
    }
  },
  methods: {
    toggleMode() {
      this.isSignup = !this.isSignup;
      this.error = null;
      this.success = null;
    },
    async submit() {
      this.error = null;
      this.success = null;
      const url = `/auth/${this.isSignup ? 'signup' : 'login'}`;
      const payload = {
        email: this.email,
        password: this.password
      };
      if (this.isSignup) {
        payload.name = this.name;
        if (this.phone) payload.phone = this.phone;
      }

      try {
        const { data } = await api.post(url, payload);
        const profile = JSON.parse(localStorage.getItem('kauvery-profile') || '{}');
        const user = {
          ...(data.user || {}),
          ...profile,
          id: data.userId || profile.id,
          email: this.email,
          name: this.isSignup ? this.name || profile.name : profile.name || this.name,
          phone: this.phone || profile.phone || '',
          isAdmin: Boolean(data.user?.isAdmin)
        };

        localStorage.setItem('kauvery-profile', JSON.stringify(user));
        store.dispatch(setAuth({ token: data.token, user }));
        this.success = this.isSignup ? 'Account created successfully. Redirecting...' : null;
        this.$router.push(user.isAdmin ? '/admin' : '/');
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to sign in. Check your credentials.';
      }
    }
  }
};
</script>

<style>
.page-shell {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
.form-card {
  width: 100%;
  max-width: 440px;
  padding: 28px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}
.form-card h2 {
  margin-bottom: 8px;
  font-size: 1.75rem;
}
.subtitle {
  margin-bottom: 22px;
  color: #475569;
}
.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}
.field label {
  margin-bottom: 8px;
  color: #334155;
  font-size: 0.95rem;
}
.field input {
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 1rem;
}
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.primary-button,
.secondary-button {
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
}
.primary-button {
  background: #0f172a;
  color: white;
}
.secondary-button {
  background: #e2e8f0;
  color: #0f172a;
}
.error-message {
  margin-top: 16px;
  color: #b91c1c;
}
</style>
