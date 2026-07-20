<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h2>Shop</h2>
        <p>Browse available items and add them to your cart.</p>
      </div>
      <div class="status">
        <span v-if="loading">Loading items...</span>
        <span v-else>{{ items.length }} items found</span>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="item-grid">
      <article v-for="item in items" :key="item.id" class="item-card">
        <div class="item-header">
          <h3>{{ item.name }}</h3>
          <span class="item-price">₹{{ item.price }}</span>
        </div>
        <p class="item-description">{{ item.description }}</p>
        <button class="primary-button" @click="addToCart(item.id)">Add to cart</button>
      </article>
    </div>
  </div>
</template>

<script>
import api from '../api';
import store from '../store/reduxStore';

export default {
  name: 'Shop',
  data() {
    return {
      items: [],
      loading: true,
      error: null
    };
  },
  async created() {
    try {
      const { data } = await api.get('/items');
      this.items = data;
    } catch (err) {
      this.error = 'Unable to load items. Please try again later.';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async addToCart(itemId) {
      const token = store.getState().auth.token;
      if (!token) {
        this.$router.push('/login');
        return;
      }
      try {
        await api.post('/cart/add', { itemId, qty: 1 });
        alert('Item added to cart');
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to add item to cart.';
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
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: white;
  padding: 20px 24px;
  border-radius: 18px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}
.page-header h2 {
  margin: 0;
  font-size: 1.8rem;
}
.page-header p {
  margin: 8px 0 0;
  color: #475569;
}
.status {
  color: #334155;
  font-weight: 600;
}
.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}
.item-card {
  padding: 18px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.item-header h3 {
  margin: 0;
}
.item-price {
  font-weight: 700;
  color: #0f172a;
}
.item-description {
  color: #475569;
  min-height: 48px;
}
.primary-button {
  margin-top: auto;
  border: none;
  background: #0f172a;
  color: white;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
}
.error-message {
  color: #b91c1c;
}
</style>
