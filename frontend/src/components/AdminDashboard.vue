<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h2>Admin Dashboard</h2>
        <p>Manage inventory from the admin panel.</p>
      </div>
      <span class="status">{{ items.length }} items loaded</span>
    </div>

    <form @submit.prevent="addItem" class="form-card admin-form">
      <div class="field">
        <label>Name</label>
        <input v-model="name" placeholder="Name" required />
      </div>
      <div class="field">
        <label>Price</label>
        <input v-model.number="price" type="number" placeholder="Price" required />
      </div>
      <div class="field">
        <label>Description</label>
        <textarea v-model="description" placeholder="Description"></textarea>
      </div>
      <button class="primary-button">Add Item</button>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">{{ success }}</div>
    </form>

    <div class="items-list">
      <article v-for="it in items" :key="it.id" class="item-card">
        <h3>{{ it.name }}</h3>
        <p>{{ it.description }}</p>
        <span class="item-price">₹{{ it.price }}</span>
      </article>
    </div>
  </div>
</template>

<script>
import api from '../api';
import store from '../store/reduxStore';

export default {
  data() {
    return {
      name: '',
      price: 0,
      description: '',
      items: [],
      error: null,
      success: null
    };
  },
  async created() {
    await this.loadItems();
  },
  methods: {
    async loadItems() {
      try {
        const res = await api.get('/items');
        this.items = res.data;
      } catch (err) {
        this.error = 'Unable to load items.';
      }
    },
    async addItem() {
      this.error = null;
      this.success = null;
      const token = store.getState().auth.token;
      if (!token) {
        this.error = 'Please login as admin to add items.';
        return;
      }
      try {
        await api.post('/items', {
          name: this.name,
          price: Number(this.price),
          description: this.description
        });
        this.success = 'Item added successfully.';
        this.name = '';
        this.price = 0;
        this.description = '';
        await this.loadItems();
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to add item.';
      }
    }
  }
};
</script>

<style>
.page-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}
.page-header h2 {
  margin: 0;
  font-size: 1.8rem;
}
.form-card {
  padding: 24px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 16px;
}
.admin-form .field {
  display: grid;
  gap: 8px;
}
.field input,
.field textarea {
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
}
.primary-button {
  border: none;
  border-radius: 12px;
  background: #0f172a;
  color: white;
  padding: 12px 16px;
  cursor: pointer;
  width: fit-content;
}
.items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}
.item-card {
  padding: 18px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}
.item-card h3 {
  margin: 0 0 10px;
}
.item-price {
  display: inline-block;
  margin-top: 12px;
  color: #0f172a;
  font-weight: 700;
}
.error-message {
  color: #b91c1c;
}
.success-message {
  color: #047857;
}
</style>
