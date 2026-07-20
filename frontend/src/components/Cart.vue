<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h2>Cart</h2>
        <p>Your saved cart items appear below.</p>
      </div>
      <span class="status">Total: ₹{{ totalPrice }}</span>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="cart.length === 0" class="empty-state">
      <p>Your cart is empty.</p>
      <router-link to="/" class="secondary-button">Browse items</router-link>
    </div>

    <div v-else class="cart-table">
      <div v-for="item in cart" :key="item.itemId" class="cart-row">
        <div>
          <h3>{{ item.name }}</h3>
          <p>Quantity: {{ item.qty }}</p>
        </div>
        <div class="row-actions">
          <span class="item-price">₹{{ item.price }}</span>
          <button class="danger-button" @click="removeItem(item.itemId)">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api';
import store from '../store/reduxStore';

export default {
  name: 'Cart',
  data() {
    return {
      cart: [],
      error: null
    };
  },
  computed: {
    totalPrice() {
      return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }
  },
  async created() {
    await this.fetchCart();
  },
  methods: {
    async fetchCart() {
      this.error = null;
      try {
        const token = store.getState().auth.token;
        const { data } = await api.get('/cart');
        this.cart = data;
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to load cart. Please login and try again.';
      }
    },
    async removeItem(itemId) {
      try {
        const token = store.getState().auth.token;
        const { data } = await api.post('/cart/remove', { itemId });
        this.cart = data;
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to remove item.';
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
.status {
  font-weight: 700;
  color: #0f172a;
}
.cart-table {
  display: grid;
  gap: 16px;
}
.cart-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}
.cart-row h3 {
  margin: 0 0 6px;
}
.row-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}
.item-price {
  font-weight: 700;
}
.danger-button,
.secondary-button {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
}
.danger-button {
  background: #ef4444;
  color: white;
}
.secondary-button {
  background: #e2e8f0;
  color: #0f172a;
  text-decoration: none;
}
.empty-state {
  padding: 24px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  text-align: center;
}
.error-message {
  color: #b91c1c;
}
</style>
