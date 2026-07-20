<template>
  <div class="cart-shell">
    <header class="cart-header">
      <div>
        <p class="eyebrow">Your basket</p>
        <h1>Shopping Cart</h1>
        <p class="subtitle">A curated collection of your selected grocery items. Review before checkout.</p>
      </div>
      <div class="summary-chip">
        <span>{{ cart.length }} items</span>
        <strong>₹{{ totalPrice.toFixed(2) }}</strong>
      </div>
    </header>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="statusMessage" class="status-info">{{ statusMessage }}</div>

    <div v-if="cart.length === 0" class="empty-state">
      <p>Your cart is empty.</p>
      <router-link to="/" class="secondary-button">Browse products</router-link>
    </div>

    <div v-else class="cart-content">
      <section class="cart-list">
        <article v-for="item in cart" :key="item.itemId" class="cart-item-card">
          <div class="item-details">
            <div class="item-meta">
              <h2>{{ item.name }}</h2>
              <div class="price-meta">
                <span v-if="item.originalPrice && item.price < item.originalPrice" class="original-price">₹{{ item.originalPrice.toFixed(2) }}</span>
                <span class="item-price">₹{{ item.price.toFixed(2) }} / item</span>
              </div>
              <p class="unit-price">Line total: <strong>₹{{ (item.price * item.qty).toFixed(2) }}</strong></p>
            </div>
            <div class="item-price-block">
              <button class="danger-button" @click="removeItem(item.itemId)">Remove</button>
            </div>
          </div>

          <div class="quantity-row">
            <button class="quantity-button" type="button" @click="updateQuantity(item.itemId, item.qty - 1)" :disabled="item.qty <= 1">−</button>
            <span class="quantity-value">{{ item.qty }}</span>
            <button class="quantity-button" type="button" @click="updateQuantity(item.itemId, item.qty + 1)">+</button>
          </div>
        </article>

        <div v-if="recommended.length" class="recommended-panel">
          <div class="recommended-header">
            <p class="eyebrow">Recommended for you</p>
            <span>Discover more favourites to complete your order</span>
          </div>
          <div class="recommended-grid">
            <article v-for="item in recommended" :key="item.id" class="recommended-card">
              <div>
                <h3>{{ item.name }}</h3>
                <p>{{ item.description }}</p>
              </div>
              <div class="recommended-footer">
                <span class="item-price">₹{{ item.price.toFixed(2) }}</span>
                <button class="primary-button" @click="addRecommended(item.id)">Add</button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <aside class="order-summary">
        <div class="summary-card">
          <p class="eyebrow">Order summary</p>
          <div class="summary-line">
            <span>Items total</span>
            <span>₹{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-line">
            <span>Saved</span>
            <span>₹{{ totalSavings.toFixed(2) }}</span>
          </div>
          <div class="summary-line">
            <span>Delivery</span>
            <span>Free</span>
          </div>
          <div class="summary-line total">
            <span>Total</span>
            <strong>₹{{ totalPrice.toFixed(2) }}</strong>
          </div>
          <button class="checkout-button" @click="checkout" :disabled="cartLoading">Proceed to checkout</button>
          <router-link to="/" class="secondary-button wide-button">Continue shopping</router-link>
          <p class="summary-note">You can remove items, adjust quantities, or keep shopping to build your order.</p>
        </div>
      </aside>
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
      recommended: [],
      error: null,
      statusMessage: null,
      cartLoading: false
    };
  },
  computed: {
    totalPrice() {
      return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },
    subtotal() {
      return this.totalPrice;
    },
    totalSavings() {
      return this.cart.reduce((sum, item) => {
        const original = item.originalPrice || item.price;
        return sum + (original - item.price) * item.qty;
      }, 0);
    }
  },
  async created() {
    await Promise.all([this.fetchCart(), this.fetchRecommendations()]);
  },
  methods: {
    async fetchCart() {
      this.error = null;
      try {
        const { data } = await api.get('/cart');
        this.cart = data;
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to load cart. Please login and try again.';
      }
    },
    async fetchRecommendations() {
      try {
        const { data } = await api.get('/items');
        const cartIds = new Set(this.cart.map(item => item.itemId));
        this.recommended = data.filter(item => !cartIds.has(item.id)).slice(0, 4);
      } catch (err) {
        // ignore recommended failures
      }
    },
    async removeItem(itemId) {
      this.error = null;
      try {
        const { data } = await api.post('/cart/remove', { itemId });
        this.cart = data;
        this.statusMessage = 'Item removed from cart.';
        await this.fetchRecommendations();
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to remove item.';
      }
    },
    async updateQuantity(itemId, qty) {
      this.error = null;
      if (qty < 1) {
        return;
      }
      try {
        this.cartLoading = true;
        const { data } = await api.post('/cart/update', { itemId, qty });
        this.cart = data;
        this.statusMessage = 'Cart updated successfully.';
        await this.fetchRecommendations();
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to update quantity.';
      } finally {
        this.cartLoading = false;
      }
    },
    async addRecommended(itemId) {
      try {
        await api.post('/cart/add', { itemId, qty: 1 });
        await this.fetchCart();
        await this.fetchRecommendations();
        this.statusMessage = 'Item added to cart.';
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to add item.';
      }
    },
    checkout() {
      this.statusMessage = 'Checkout integration is coming soon. Please review your cart and continue shopping.';
    }
  }
};
</script>

<style>
.cart-shell {
  display: grid;
  gap: 28px;
}
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding: 30px;
  border-radius: 28px;
  background: linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.08);
}
.cart-header .eyebrow {
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #6366f1;
  font-size: 0.8rem;
}
.cart-header h1 {
  margin: 0;
  font-size: 2.6rem;
  line-height: 1.05;
}
.cart-header .subtitle {
  margin: 14px 0 0;
  max-width: 520px;
  color: #475569;
  font-size: 1rem;
  line-height: 1.6;
}
.summary-chip {
  align-self: center;
  background: white;
  border-radius: 18px;
  padding: 18px 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.summary-chip span {
  color: #64748b;
}
.summary-chip strong {
  font-size: 1.75rem;
}
.cart-content {
  display: grid;
  grid-template-columns: 1.5fr 0.9fr;
  gap: 26px;
}
.cart-list {
  display: grid;
  gap: 18px;
}
.cart-item-card {
  padding: 24px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}
.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.item-meta h2 {
  margin: 0;
  font-size: 1.25rem;
}
.item-meta p {
  margin: 10px 0 0;
  color: #475569;
}
.item-price-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}
.price-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}
.quantity-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
}
.quantity-button {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #0f172a;
  font-size: 1.25rem;
  cursor: pointer;
}
.quantity-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.quantity-value {
  min-width: 38px;
  text-align: center;
  font-weight: 700;
}
.unit-price {
  margin: 12px 0 0;
  color: #64748b;
}
.status-info {
  padding: 16px;
  border-radius: 18px;
  background: #ecfdf5;
  color: #166534;
  font-weight: 600;
}
.wide-button {
  width: 100%;
}
.item-price {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
}
.danger-button,
.secondary-button,
.checkout-button {
  border: none;
  border-radius: 14px;
  padding: 12px 18px;
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
.order-summary {
  position: sticky;
  top: 24px;
}
.summary-card {
  display: grid;
  gap: 18px;
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}
.summary-card .eyebrow {
  margin: 0;
  color: #64748b;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-size: 0.8rem;
}
.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #475569;
}
.summary-line.total {
  font-size: 1.15rem;
  font-weight: 700;
}
.checkout-button {
  width: 100%;
  background: #0f172a;
  color: white;
  font-weight: 700;
}
.summary-note {
  margin: 0;
  color: #64748b;
  line-height: 1.75;
}
.empty-state {
  padding: 32px;
  border-radius: 24px;
  background: white;
  text-align: center;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}
.recommended-panel {
  margin-top: 32px;
  padding: 24px;
  border-radius: 24px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.15);
}
.recommended-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.recommended-header .eyebrow {
  margin: 0;
  color: #4f46e5;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.recommended-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}
.recommended-card {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
}
.recommended-card h3 {
  margin: 0;
  font-size: 1.05rem;
}
.recommended-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.75;
}
.recommended-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.recommended-footer .item-price {
  font-weight: 700;
  color: #0f172a;
}
.error-message {
  padding: 14px 18px;
  border-radius: 16px;
  background: #fee2e2;
  color: #b91c1c;
}
</style>
