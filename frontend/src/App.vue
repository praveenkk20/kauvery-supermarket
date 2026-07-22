<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">Kauvery Supermarket</div>
      <nav class="nav-links">
        <router-link v-if="!auth.user?.isAdmin" to="/" class="nav-link">Shop</router-link>
        <router-link v-if="auth.token && !auth.user?.isAdmin" to="/cart" class="nav-link">Cart</router-link>
        <router-link v-if="auth.user?.isAdmin" to="/admin" class="nav-link">Admin</router-link>
        <router-link v-if="!auth.token" to="/login" class="nav-link action">Login</router-link>
        <button v-else type="button" class="nav-link action" @click="logout">Logout</button>
        <button v-if="auth.token" type="button" class="profile-trigger" @click="openProfileModal">
          <span v-if="profilePhoto" class="avatar-photo">
            <img :src="profilePhoto" alt="Profile" />
          </span>
          <span v-else class="avatar-fallback">{{ initials }}</span>
        </button>
      </nav>
    </header>

    <main class="content">
      <router-view />
    </main>

    <div v-if="showProfileModal" class="modal-backdrop" @click.self="closeProfileModal">
      <div class="modal-panel">
        <div class="modal-header">
          <div>
            <h3>Your profile</h3>
            <p>Update your details and add a profile photo.</p>
          </div>
          <button class="modal-close" type="button" @click="closeProfileModal">×</button>
        </div>

        <form @submit.prevent="saveProfile" class="modal-form">
          <div class="field">
            <label>Name</label>
            <input v-model="profileForm.name" placeholder="Your name" />
          </div>
          <div class="field">
            <label>Email</label>
            <input v-model="profileForm.email" type="email" placeholder="you@example.com" />
          </div>
          <div class="field">
            <label>Phone</label>
            <input v-model="profileForm.phone" type="tel" placeholder="Phone number" />
          </div>
          <div class="field">
            <label>Profile photo</label>
            <input type="file" accept="image/*" @change="onPhotoSelect" />
            <div v-if="profileForm.photoUrl" class="photo-preview">
              <img :src="profileForm.photoUrl" alt="Preview" />
            </div>
          </div>

          <div class="modal-actions">
            <button class="secondary-button" type="button" @click="closeProfileModal">Cancel</button>
            <button class="primary-button" type="submit">Save profile</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import store, { clearAuth, setAuth } from './store/reduxStore';

export default {
  name: 'App',
  data() {
    return {
      auth: store.getState().auth,
      showProfileModal: false,
      profilePhoto: '',
      profileForm: {
        name: '',
        email: '',
        phone: '',
        photoUrl: ''
      }
    };
  },
  computed: {
    initials() {
      const source = this.profileForm.name || this.auth.user?.name || this.auth.user?.email || 'U';
      return source
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(piece => piece[0])
        .join('')
        .toUpperCase() || 'U';
    }
  },
  created() {
    this.unsubscribe = store.subscribe(() => {
      this.auth = store.getState().auth;
      this.syncProfileFromStore();
    });
    this.loadProfile();
  },
  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  },
  methods: {
    loadProfile() {
      try {
        const saved = JSON.parse(localStorage.getItem('kauvery-profile') || '{}');
        const baseUser = this.auth.user || {};
        this.profileForm = {
          name: saved.name || baseUser.name || '',
          email: saved.email || baseUser.email || '',
          phone: saved.phone || baseUser.phone || '',
          photoUrl: saved.photoUrl || baseUser.photoUrl || ''
        };
        this.profilePhoto = this.profileForm.photoUrl;
      } catch (err) {
        this.profileForm = { name: '', email: '', phone: '', photoUrl: '' };
        this.profilePhoto = '';
      }
    },
    syncProfileFromStore() {
      const baseUser = store.getState().auth.user || {};
      if (!this.profileForm.name && baseUser.name) {
        this.profileForm.name = baseUser.name;
      }
      if (!this.profileForm.email && baseUser.email) {
        this.profileForm.email = baseUser.email;
      }
      if (!this.profileForm.phone && baseUser.phone) {
        this.profileForm.phone = baseUser.phone;
      }
      if (!this.profileForm.photoUrl && baseUser.photoUrl) {
        this.profileForm.photoUrl = baseUser.photoUrl;
      }
      this.profilePhoto = this.profileForm.photoUrl;
    },
    openProfileModal() {
      this.loadProfile();
      this.showProfileModal = true;
    },
    closeProfileModal() {
      this.showProfileModal = false;
    },
    saveProfile() {
      const nextUser = {
        ...(this.auth.user || {}),
        name: this.profileForm.name,
        email: this.profileForm.email,
        phone: this.profileForm.phone,
        photoUrl: this.profileForm.photoUrl
      };

      localStorage.setItem('kauvery-profile', JSON.stringify(nextUser));
      store.dispatch(setAuth({ token: this.auth.token, user: nextUser }));
      this.auth = store.getState().auth;
      this.profilePhoto = nextUser.photoUrl || '';
      this.showProfileModal = false;
    },
    onPhotoSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileForm.photoUrl = e.target.result;
        this.profilePhoto = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    logout() {
      store.dispatch(clearAuth());
      localStorage.removeItem('kauvery-profile');
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
  align-items: center;
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
.profile-trigger {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: #0f172a;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
}
.avatar-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  font-weight: 700;
}
.content {
  max-width: 1080px;
  margin: 24px auto;
  padding: 0 16px 24px;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}
.modal-panel {
  width: min(520px, 100%);
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.18);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}
.modal-header h3 {
  margin: 0 0 4px;
}
.modal-header p {
  margin: 0;
  color: #64748b;
}
.modal-close {
  border: none;
  background: transparent;
  color: #334155;
  font-size: 1.6rem;
  cursor: pointer;
}
.modal-form {
  display: grid;
  gap: 14px;
}
.field {
  display: grid;
  gap: 8px;
}
.field input {
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font: inherit;
}
.photo-preview {
  margin-top: 8px;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}
.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
.primary-button,
.secondary-button {
  border: none;
  border-radius: 12px;
  padding: 11px 14px;
  cursor: pointer;
  font-weight: 600;
}
.primary-button {
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
  color: white;
}
.secondary-button {
  background: #f1f5f9;
  color: #0f172a;
}
</style>
