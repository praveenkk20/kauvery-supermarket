<template>
  <div class="page-shell">
    <section class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Fresh picks for every home</p>
        <h2>Browse groceries and daily essentials in a cleaner, faster way.</h2>
        <p>Search, filter, and jump between categories like a modern online supermarket.</p>
      </div>

      <div class="search-box">
        <input v-model.trim="filters.search" type="text" placeholder="Search for products or categories" />
        <button type="button" class="wishlist-toggle" @click="showWishlist = !showWishlist">
          <span>♡</span>
          Wishlist
          <span class="wishlist-count">{{ wishlist.length }}</span>
        </button>
        <button type="button" class="filter-toggle" @click="showFilters = !showFilters">
          {{ showFilters ? 'Hide filters' : 'Show filters' }}
        </button>
      </div>
    </section>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="showWishlist" class="wishlist-panel">
      <div class="wishlist-header">
        <div>
          <h3>Your wishlist</h3>
          <p>Saved items for later.</p>
        </div>
        <button class="icon-button" type="button" @click="showWishlist = false">×</button>
      </div>
      <div v-if="wishlist.length" class="wishlist-items">
        <div v-for="item in wishlist" :key="item.id" class="wishlist-item">
          <div>
            <strong>{{ item.name }}</strong>
            <p>{{ item.category || 'General' }}</p>
          </div>
          <div class="wishlist-actions">
            <button class="secondary-button" type="button" @click="toggleWishlist(item)">Remove</button>
            <button class="primary-button" type="button" @click="addToCart(item.id)">Add</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">No saved items yet. Tap the heart on any product to save it here.</div>
    </div>

    <section class="results-card">
      <div class="results-top">
        <div>
          <h3>{{ visibleItemsCount }} items found</h3>
          <p v-if="filters.search">Showing results for “{{ filters.search }}”</p>
        </div>
        <div class="sort-row">
          <label for="sort-select">Sort by</label>
          <select id="sort-select" v-model="filters.sortBy">
            <option value="featured">Featured</option>
            <option value="highestDiscount">Highest discount</option>
            <option value="lowestPrice">Lowest price</option>
            <option value="highestPrice">Highest price</option>
          </select>
        </div>
      </div>

      <div v-if="showFilters || hasActiveFilters" class="filter-panel">
        <div class="filter-group">
          <span class="filter-title">Price range</span>
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
      </div>

      <div class="category-tabs">
        <button type="button" class="tab-chip" :class="{ active: activeCategory === 'All' }" @click="activeCategory = 'All'">All</button>
        <button v-for="cat in categoryOptions" :key="cat" type="button" class="tab-chip" :class="{ active: activeCategory === cat }" @click="activeCategory = cat">
          {{ cat }}
        </button>
      </div>

      <div v-if="loading" class="loading-state">Loading items...</div>

      <div v-else-if="displayCategories.length">
        <section v-for="category in displayCategories" :key="category" class="category-section">
          <div class="category-title-row">
            <div>
              <h4>{{ category }}</h4>
              <p>{{ getItemsForCategory(category).length }} products</p>
            </div>
          </div>

          <div class="item-grid">
            <article v-for="item in getItemsForCategory(category)" :key="item.id" class="item-card">
              <div class="item-media">
                <img v-if="item.imageUrl" :src="item.imageUrl" alt="Product image" class="item-image" />
                <div v-else class="item-image placeholder">No image</div>
                <span v-if="isOffer(item)" class="discount-badge">Save {{ discountPercent(item) }}%</span>
              </div>

              <div class="item-body">
                <div class="meta-row">
                  <span class="item-category">{{ item.category || 'General' }}</span>
                  <button class="wishlist-heart" type="button" @click="toggleWishlist(item)">
                    {{ isWishlisted(item) ? '♥' : '♡' }}
                  </button>
                </div>
                <h3>{{ item.name }}</h3>
                <p class="item-description">{{ item.description }}</p>
                <div v-if="isOffer(item)" class="price-row">
                  <span class="original-price">₹{{ item.price }}</span>
                  <strong class="discounted-price">₹{{ item.discountPrice }}</strong>
                </div>
                <div v-else class="price-row">
                  <strong class="item-price">₹{{ item.price }}</strong>
                </div>
                <button class="primary-button" @click="addToCart(item.id)">Add to cart</button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div v-else class="empty-state">
        <h4>No items match your current filters</h4>
        <p>Try changing the search text, removing price limits, or switching categories.</p>
      </div>
    </section>
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
      showFilters: false,
      showWishlist: false,
      activeCategory: 'All',
      wishlist: [],
      filters: {
        minPrice: null,
        maxPrice: null,
        onlyOffers: false,
        sortBy: 'featured',
        search: ''
      }
    };
  },
  async created() {
    this.loadWishlist();
    try {
      const { data } = await api.get('/items');
      this.items = data;
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
    hasActiveFilters() {
      return Boolean(this.filters.search || this.filters.minPrice != null || this.filters.maxPrice != null || this.filters.onlyOffers);
    },
    visibleItemsCount() {
      return this.getItemsForCategory(this.activeCategory === 'All' ? null : this.activeCategory).length;
    },
    displayCategories() {
      if (this.activeCategory === 'All') {
        return this.categoryOptions;
      }
      return [this.activeCategory];
    }
  },
  methods: {
    loadWishlist() {
      try {
        this.wishlist = JSON.parse(localStorage.getItem('kauvery-wishlist') || '[]');
      } catch (err) {
        this.wishlist = [];
      }
    },
    saveWishlist() {
      localStorage.setItem('kauvery-wishlist', JSON.stringify(this.wishlist));
    },
    isWishlisted(item) {
      return this.wishlist.some(entry => entry.id === item.id);
    },
    toggleWishlist(item) {
      if (this.isWishlisted(item)) {
        this.wishlist = this.wishlist.filter(entry => entry.id !== item.id);
      } else {
        this.wishlist = [...this.wishlist, item];
      }
      this.saveWishlist();
    },
    isOffer(item) {
      return item.discountPrice != null && item.discountPrice < item.price;
    },
    discountPercent(item) {
      if (!this.isOffer(item)) return 0;
      return Math.round(((item.price - item.discountPrice) / item.price) * 100);
    },
    getItemsForCategory(category) {
      const priceValue = item => {
        if (this.isOffer(item)) return item.discountPrice;
        return item.price;
      };
      const searchText = this.filters.search.trim().toLowerCase();

      return this.items
        .filter(item => {
          const itemCategory = item.category || 'General';
          if (category && itemCategory !== category) return false;

          const matchesSearch = !searchText || [item.name, item.description, itemCategory].some(value =>
            String(value || '').toLowerCase().includes(searchText)
          );
          if (!matchesSearch) return false;

          const price = priceValue(item);
          if (this.filters.minPrice != null && this.filters.minPrice !== '' && price < this.filters.minPrice) return false;
          if (this.filters.maxPrice != null && this.filters.maxPrice !== '' && price > this.filters.maxPrice) return false;

          if (this.filters.onlyOffers) {
            return this.isOffer(item);
          }
          return true;
        })
        .slice()
        .sort((a, b) => {
          if (this.filters.sortBy === 'highestDiscount') {
            const discountA = this.discountPercent(a);
            const discountB = this.discountPercent(b);
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
    },
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
.hero-card,
.results-card,
.wishlist-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  border-radius: 24px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  padding: 24px;
}
.hero-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.hero-copy h2 {
  margin: 4px 0 8px;
  font-size: 1.7rem;
  color: #0f172a;
}
.hero-copy p {
  margin: 0;
  color: #475569;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.search-box {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.search-box input {
  flex: 1;
  min-width: 240px;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  outline: none;
  font-size: 1rem;
}
.search-box input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.15);
}
.filter-toggle,
.wishlist-toggle,
.primary-button,
.tab-chip,
.wishlist-heart {
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.filter-toggle:hover,
.wishlist-toggle:hover,
.primary-button:hover,
.tab-chip:hover,
.wishlist-heart:hover {
  transform: translateY(-1px);
}
.filter-toggle,
.wishlist-toggle {
  padding: 12px 16px;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.wishlist-toggle {
  background: #f43f5e;
}
.wishlist-count {
  background: rgba(255,255,255,0.2);
  border-radius: 999px;
  padding: 2px 8px;
}
.results-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.results-top h3 {
  margin: 0;
  color: #0f172a;
}
.results-top p {
  margin: 4px 0 0;
  color: #64748b;
}
.sort-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334155;
}
.sort-row select {
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: white;
}
.filter-panel {
  display: grid;
  gap: 16px;
  padding: 16px;
  border-radius: 18px;
  background: #f8fafc;
  margin-bottom: 18px;
}
.filter-group {
  display: grid;
  gap: 10px;
}
.filter-title {
  color: #334155;
  font-weight: 700;
}
.range-group .range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}
.range-inputs input {
  flex: 1;
  min-width: 120px;
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
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}
.tab-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: white;
  color: #475569;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
}
.tab-chip.active {
  background: #0f172a;
  color: white;
}
.loading-state,
.empty-state {
  text-align: center;
  padding: 24px;
  border-radius: 18px;
  background: #f8fafc;
  color: #475569;
}
.wishlist-panel {
  display: grid;
  gap: 12px;
}
.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.wishlist-header h3 {
  margin: 0;
}
.wishlist-header p {
  margin: 4px 0 0;
  color: #64748b;
}
.icon-button {
  border: none;
  background: transparent;
  font-size: 1.4rem;
  cursor: pointer;
}
.wishlist-items {
  display: grid;
  gap: 12px;
}
.wishlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f8fafc;
}
.wishlist-item p {
  margin: 4px 0 0;
  color: #64748b;
}
.wishlist-actions {
  display: flex;
  gap: 8px;
}
.wishlist-heart {
  background: transparent;
  color: #f43f5e;
  font-size: 1.2rem;
}
.category-section {
  margin-bottom: 18px;
}
.category-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.category-title-row h4 {
  margin: 0;
  color: #0f172a;
}
.category-title-row p {
  margin: 4px 0 0;
  color: #64748b;
}
.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}
.item-card {
  border-radius: 20px;
  background: white;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.item-media {
  position: relative;
  min-height: 180px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.item-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-weight: 600;
}
.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #dc2626;
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
}
.item-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}
.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.item-category {
  color: #64748b;
  font-size: 0.9rem;
  text-transform: capitalize;
}
.offer-pill {
  font-size: 0.75rem;
  font-weight: 700;
  color: #dc2626;
  background: #fee2e2;
  padding: 4px 8px;
  border-radius: 999px;
}
.item-body h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.05rem;
}
.price-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
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
.item-description {
  color: #475569;
  min-height: 52px;
  margin: 0;
}
.primary-button {
  margin-top: auto;
  border: none;
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
  color: white;
  padding: 12px 14px;
  border-radius: 12px;
  font-weight: 600;
}
.secondary-button {
  border: none;
  background: #e2e8f0;
  color: #0f172a;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 600;
}
.error-message {
  color: #b91c1c;
  background: #fef2f2;
  padding: 12px 14px;
  border-radius: 12px;
}
@media (max-width: 640px) {
  .hero-card,
  .results-card,
  .wishlist-panel {
    padding: 18px;
  }
  .results-top {
    align-items: flex-start;
    flex-direction: column;
  }
  .wishlist-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
