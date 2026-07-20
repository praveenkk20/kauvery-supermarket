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

    <div class="filter-panel">
      <div class="filter-group">
        <label>Category</label>
        <select v-model="filters.category">
          <option value="All">All</option>
          <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div class="filter-group range-group">
        <label>Price range</label>
        <div class="range-inputs">
          <input v-model.number="filters.minPrice" type="number" placeholder="Min" min="0" />
          <span>–</span>
          <input v-model.number="filters.maxPrice" type="number" placeholder="Max" min="0" />
        </div>
      </div>
      <div class="filter-group">
        <label class="toggle-label">
          <input type="checkbox" v-model="filters.onlyOffers" />
          Show only offers
        </label>
      </div>
      <div class="filter-group">
        <label>Sort</label>
        <select v-model="filters.sortBy">
          <option value="featured">Featured</option>
          <option value="highestDiscount">Highest discount</option>
          <option value="lowestPrice">Lowest price</option>
          <option value="highestPrice">Highest price</option>
        </select>
      </div>
    </div>

    <div class="item-grid">
      <article v-for="item in filteredItems" :key="item.id" class="item-card">
        <div class="item-media">
          <img v-if="item.imageUrl" :src="item.imageUrl" alt="Product image" class="item-image" />
          <div v-else class="item-image placeholder">No image</div>
        </div>
        <div class="item-header">
          <div>
            <h3>{{ item.name }}</h3>
            <div class="item-category">{{ item.category || 'General' }}</div>
            <div v-if="item.discountPrice && item.discountPrice < item.price" class="price-row">
              <span class="original-price">₹{{ item.price }}</span>
              <strong class="discounted-price">₹{{ item.discountPrice }}</strong>
            </div>
            <div v-else class="price-row">
              <strong class="item-price">₹{{ item.price }}</strong>
            </div>
          </div>
          <span v-if="item.discountPrice && item.discountPrice < item.price" class="discount-badge">Sale</span>
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
      error: null,
      filters: {
        category: 'All',
        minPrice: null,
        maxPrice: null,
        onlyOffers: false,
        sortBy: 'featured'
      }
    };
  },
  async created() {
    try {
      const { data } = await api.get('/items');
      this.items = data;
      if (data.length && !this.filters.category) {
        this.filters.category = 'All';
      }
    } catch (err) {
      this.error = 'Unable to load items. Please try again later.';
    } finally {
      this.loading = false;
    }
  },
  computed: {
    categoryOptions() {
      const categories = new Set(this.items.map(item => item.category || 'General'));
      return [...categories].sort();
    },
    filteredItems() {
      const priceValue = item => {
        if (item.discountPrice && item.discountPrice < item.price) return item.discountPrice;
        return item.price;
      };

      return this.items
        .filter(item => {
          const categoryMatch = this.filters.category === 'All' || (item.category || 'General') === this.filters.category;
          if (!categoryMatch) return false;

          const price = priceValue(item);
          if (this.filters.minPrice != null && this.filters.minPrice !== '' && price < this.filters.minPrice) return false;
          if (this.filters.maxPrice != null && this.filters.maxPrice !== '' && price > this.filters.maxPrice) return false;

          if (this.filters.onlyOffers) {
            return item.discountPrice != null && item.discountPrice < item.price;
          }
          return true;
        })
        .slice()
        .sort((a, b) => {
          if (this.filters.sortBy === 'highestDiscount') {
            const discountA = a.discountPrice ? ((a.price - a.discountPrice) / a.price) : 0;
            const discountB = b.discountPrice ? ((b.price - b.discountPrice) / b.price) : 0;
            return discountB - discountA;
          }
          if (this.filters.sortBy === 'lowestPrice') {
            return priceValue(a) - priceValue(b);
          }
          if (this.filters.sortBy === 'highestPrice') {
            return priceValue(b) - priceValue(a);
          }
          return 0;
        });
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
.filter-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  padding: 18px 0;
}
.filter-group {
  display: grid;
  gap: 8px;
}
.range-group .range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}
.range-inputs input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
}
.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #334155;
  font-weight: 600;
}
.item-category {
  margin: 8px 0 0;
  color: #475569;
  font-size: 0.92rem;
  text-transform: capitalize;
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
  align-items: flex-start;
  gap: 12px;
}
.item-header h3 {
  margin: 0;
}
.price-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}
.original-price {
  color: #94a3b8;
  text-decoration: line-through;
}
.discounted-price,
.item-price {
  font-weight: 700;
  color: #0f172a;
}
.discount-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f8fafc;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 700;
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
