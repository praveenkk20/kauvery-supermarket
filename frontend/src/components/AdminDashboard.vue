<template>
  <div class="page-shell">
    <section class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Admin control center</p>
        <h2>Operate your supermarket from one streamlined cockpit.</h2>
        <p>Manage inventory, orders, customers, categories, reviews, and campaigns without leaving the workspace.</p>
      </div>
      <div class="hero-actions">
        <button class="primary-button" type="button" @click="openAddModal">+ Add product</button>
        <button class="secondary-button" type="button" @click="showOfferModal = true">Publish offer</button>
        <button class="secondary-button" type="button" @click="openCategoryModal">+ Add category</button>
      </div>
    </section>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>

    <section class="summary-grid">
      <div class="summary-card">
        <strong>{{ items.length }}</strong>
        <span>Total products</span>
      </div>
      <div class="summary-card">
        <strong>{{ categories.length }}</strong>
        <span>Categories</span>
      </div>
      <div class="summary-card">
        <strong>{{ orders.length }}</strong>
        <span>Orders</span>
      </div>
      <div class="summary-card">
        <strong>{{ customers.length }}</strong>
        <span>Customers</span>
      </div>
      <div class="summary-card">
        <strong>{{ lowStockItems.length }}</strong>
        <span>Low stock</span>
      </div>
      <div class="summary-card">
        <strong>{{ pendingOrders }}</strong>
        <span>Pending orders</span>
      </div>
      <div class="summary-card">
        <strong>₹{{ revenue.toFixed(2) }}</strong>
        <span>Revenue</span>
      </div>
      <div class="summary-card">
        <strong>{{ items.filter(item => item.discountPrice && item.discountPrice < item.price).length }}</strong>
        <span>Active offers</span>
      </div>
    </section>

    <section class="operations-grid">
      <div class="operations-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Orders</p>
            <h3>Recent orders</h3>
          </div>
        </div>
        <div v-if="orders.length" class="list-stack">
          <div v-for="order in orders.slice(0, 6)" :key="order.id" class="list-row">
            <div>
              <strong>#{{ order.id }}</strong>
              <p>{{ order.shippingAddress || 'No address provided' }}</p>
            </div>
            <div class="inline-actions">
              <select v-model="order.status" class="inline-select" @change="updateOrderStatus(order)">
                <option value="Processing">Processing</option>
                <option value="Packed">Packed</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
              <span class="amount-pill">₹{{ Number(order.total || 0).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <p v-else class="empty-state">No orders yet.</p>
      </div>

      <div class="operations-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Customers</p>
            <h3>Customer activity</h3>
          </div>
        </div>
        <div v-if="customers.length" class="list-stack">
          <div v-for="customer in customers.slice(0, 6)" :key="customer.id" class="list-row">
            <div>
              <strong>{{ customer.name || customer.email }}</strong>
              <p>{{ customer.email }}</p>
            </div>
            <div class="inline-actions">
              <span :class="customer.isBlocked ? 'pill blocked' : 'pill active'">{{ customer.isBlocked ? 'Blocked' : 'Active' }}</span>
              <button class="secondary-button small-button" type="button" @click="toggleCustomerBlock(customer)">
                {{ customer.isBlocked ? 'Unblock' : 'Block' }}
              </button>
            </div>
          </div>
        </div>
        <p v-else class="empty-state">No customer accounts found.</p>
      </div>
    </section>

    <div v-if="showItemModal" class="modal-backdrop" @click.self="closeItemModal">
      <div class="modal-panel">
        <div class="modal-header">
          <div>
            <h3>{{ itemForm.mode === 'edit' ? 'Edit product' : 'Add product' }}</h3>
            <p>{{ itemForm.mode === 'edit' ? 'Update your product details and media.' : 'Fill in the details to add a new item to the catalog.' }}</p>
          </div>
          <button class="modal-close" type="button" @click="closeItemModal">×</button>
        </div>

        <form @submit.prevent="submitItem" class="modal-form">
          <div class="field">
            <label>Name</label>
            <input v-model="itemForm.name" placeholder="Product name" required />
          </div>

          <div class="field">
            <label>Category</label>
            <select v-model="itemForm.categoryOption">
              <option value="new">Create new category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <input
              v-if="itemForm.categoryOption === 'new'"
              v-model="itemForm.newCategory"
              placeholder="Enter new category"
              class="inline-input"
            />
          </div>

          <div class="field-grid">
            <div class="field">
              <label>Price</label>
              <input v-model.number="itemForm.price" type="number" min="0" required />
            </div>
            <div class="field">
              <label>Discount price</label>
              <input v-model.number="itemForm.discountPrice" type="number" min="0" placeholder="Optional" />
            </div>
          </div>

          <div class="field">
            <label>Description</label>
            <textarea v-model="itemForm.description" placeholder="Short description"></textarea>
          </div>

          <div class="field-grid">
            <div class="field">
              <label>Stock</label>
              <input v-model.number="itemForm.stock" type="number" min="0" required />
            </div>
            <div class="field">
              <label>Status</label>
              <select v-model="itemForm.isActive">
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Product image</label>
            <input type="file" @change="onItemImageSelect" accept="image/*" />
            <p v-if="itemForm.imageFile" class="file-info">Selected: {{ itemForm.imageFile.name }}</p>
          </div>

          <div class="modal-actions">
            <button class="secondary-button" type="button" @click="closeItemModal">Cancel</button>
            <button class="primary-button" type="submit">{{ itemForm.mode === 'edit' ? 'Save changes' : 'Add item' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showCategoryModal" class="modal-backdrop" @click.self="closeCategoryModal">
      <div class="modal-panel">
        <div class="modal-header">
          <div>
            <h3>{{ categoryForm.mode === 'edit' ? 'Edit category' : 'Add category' }}</h3>
            <p>Create or update storefront categories, subcategories, and their visibility.</p>
          </div>
          <button class="modal-close" type="button" @click="closeCategoryModal">×</button>
        </div>
        <form @submit.prevent="submitCategory" class="modal-form">
          <div class="field">
            <label>Name</label>
            <input v-model="categoryForm.name" placeholder="Category name" required />
          </div>
          <div class="field">
            <label>Description</label>
            <textarea v-model="categoryForm.description" placeholder="Category description"></textarea>
          </div>
          <div class="field-grid">
            <div class="field">
              <label>Parent category</label>
              <select v-model="categoryForm.parentId">
                <option :value="null">None</option>
                <option v-for="cat in categoriesList" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="field">
              <label>Sort order</label>
              <input v-model.number="categoryForm.sortOrder" type="number" min="0" />
            </div>
          </div>
          <div class="field-grid">
            <div class="field">
              <label>Status</label>
              <select v-model="categoryForm.isActive">
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>
            <div class="field">
              <label>Category image</label>
              <input type="file" @change="onCategoryImageSelect" accept="image/*" />
            </div>
          </div>
          <div class="modal-actions">
            <button class="secondary-button" type="button" @click="closeCategoryModal">Cancel</button>
            <button class="primary-button" type="submit">{{ categoryForm.mode === 'edit' ? 'Save changes' : 'Add category' }}</button>
          </div>
        </form>
      </div>
    </div>

    <section class="offer-tools">
      <div class="offer-header">
        <div>
          <p class="eyebrow">Special offer manager</p>
          <h3>Release a fresh discount</h3>
          <p class="offer-subtitle">Choose a product and publish a limited-time discount that customers can see immediately.</p>
        </div>
        <div class="offer-badge">Offers</div>
      </div>

      <div class="offer-card">
        <div class="offer-actions">
          <p class="offer-note">Open the offer editor to select an item and set the discounted price.</p>
          <button type="button" class="primary-button" @click="showOfferModal = true">Open offer modal</button>
        </div>
        <div v-if="offerMessage" class="offer-status success-message">{{ offerMessage }}</div>
      </div>
    </section>

    <div v-if="showOfferModal" class="modal-backdrop" @click.self="closeOfferModal">
      <div class="modal-panel">
        <div class="modal-header">
          <div>
            <h3>Publish an offer</h3>
            <p>Apply a discount to a product and make it visible to shoppers immediately.</p>
          </div>
          <button class="modal-close" type="button" @click="closeOfferModal">×</button>
        </div>

        <form @submit.prevent="publishOffer" class="modal-form">
          <div class="offer-fields">
            <div class="field">
              <label>Select item</label>
              <select v-model="offerItemId" required>
                <option disabled value="">Choose product</option>
                <option v-for="it in items" :key="it.id" :value="it.id">{{ it.name }}</option>
              </select>
            </div>
            <div class="field">
              <label>Discount price</label>
              <input v-model.number="offerDiscountPrice" type="number" placeholder="Enter discount price" required />
            </div>
          </div>

          <div class="offer-actions modal-actions">
            <button type="submit" class="primary-button">Publish offer</button>
            <button type="button" class="secondary-button" @click="closeOfferModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <section class="inventory-section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Products</p>
          <h3>Inventory & product controls</h3>
        </div>
      </div>
      <div class="section-header">
        <div>
          <p class="eyebrow">Catalog</p>
          <h3>Current inventory</h3>
        </div>
      </div>

      <div v-for="category in categories" :key="category" class="category-section">
        <div class="category-title-row">
          <div>
            <h4>{{ category }}</h4>
            <p>{{ getItemsForCategory(category).length }} products</p>
          </div>
        </div>

        <div class="items-list">
          <article v-for="it in getItemsForCategory(category)" :key="it.id" class="item-card">
            <div class="item-media">
              <img v-if="it.imageUrl" :src="it.imageUrl" alt="Product image" class="item-image" />
              <div v-else class="item-image placeholder">No image</div>
            </div>
            <div class="item-body">
              <div class="item-top-row">
                <div>
                  <h3>{{ it.name }}</h3>
                  <p class="item-category">{{ it.category || 'General' }}</p>
                </div>
                <span v-if="it.discountPrice && it.discountPrice < it.price" class="item-badge">Sale</span>
              </div>
              <p class="item-description">{{ it.description }}</p>
              <div class="price-row">
                <span v-if="it.discountPrice && it.discountPrice < it.price" class="original-price">₹{{ it.price.toFixed(2) }}</span>
                <strong class="discounted-price">₹{{ (it.discountPrice && it.discountPrice < it.price) ? it.discountPrice.toFixed(2) : it.price.toFixed(2) }}</strong>
              </div>
              <div class="item-meta-row">
                <span class="status-pill" :class="it.isActive === false ? 'inactive' : 'active'">{{ it.isActive === false ? 'Inactive' : 'Active' }}</span>
                <span class="stock-pill">Stock: {{ it.stock || 0 }}</span>
              </div>
              <div class="item-actions">
                <button class="secondary-button" @click="startEdit(it)">Edit</button>
                <button class="secondary-button" @click="toggleItemStatus(it)">{{ it.isActive === false ? 'Activate' : 'Suspend' }}</button>
                <button class="danger-button" @click="removeItem(it.id)">Delete</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="inventory-section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Categories</p>
          <h3>Category management</h3>
        </div>
      </div>
      <div v-if="categoriesList.length" class="category-list">
        <div v-for="cat in categoriesList" :key="cat.id" class="category-row">
          <div>
            <strong>{{ cat.name }}</strong>
            <p>{{ cat.description || 'Category' }}</p>
          </div>
          <div class="inline-actions">
            <span :class="cat.isActive === false ? 'pill blocked' : 'pill active'">{{ cat.isActive === false ? 'Inactive' : 'Active' }}</span>
            <button class="secondary-button small-button" type="button" @click="editCategory(cat)">Edit</button>
            <button class="secondary-button small-button" type="button" @click="toggleCategoryStatus(cat)">{{ cat.isActive === false ? 'Enable' : 'Disable' }}</button>
            <button class="danger-button small-button" type="button" @click="deleteCategory(cat.id)">Delete</button>
          </div>
        </div>
      </div>
      <p v-else class="empty-state">No categories yet.</p>
    </section>

    <section class="inventory-section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Reviews</p>
          <h3>Review moderation</h3>
        </div>
      </div>
      <div v-if="reviews.length" class="review-list">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div>
            <strong>{{ review.userName }}</strong>
            <p>{{ review.comment }}</p>
          </div>
          <div class="inline-actions">
            <span class="amount-pill">⭐ {{ review.rating }}</span>
            <select v-model="review.status" class="inline-select" @change="updateReview(review)">
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button class="danger-button small-button" type="button" @click="deleteReview(review.id)">Delete</button>
          </div>
        </div>
      </div>
      <p v-else class="empty-state">No reviews yet.</p>
    </section>

    <section class="inventory-section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Settings</p>
          <h3>Store configuration</h3>
        </div>
      </div>
      <div class="settings-grid">
        <div class="setting-card">
          <h4>Store settings</h4>
          <p>Set tax, shipping, and general business rules.</p>
        </div>
        <div class="setting-card">
          <h4>Promotions</h4>
          <p>Launch flash sales, seasonal offers, and coupon campaigns.</p>
        </div>
        <div class="setting-card">
          <h4>Notifications</h4>
          <p>Control order updates, promotions, and wishlist alerts.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import api from '../api';
import store from '../store/reduxStore';

export default {
  data() {
    return {
      items: [],
      categories: [],
      orders: [],
      customers: [],
      error: null,
      success: null,
      showItemModal: false,
      showOfferModal: false,
      offerItemId: '',
      offerDiscountPrice: null,
      offerMessage: null,
      itemForm: {
        mode: 'add',
        itemId: null,
        name: '',
        categoryOption: 'General',
        category: 'General',
        newCategory: '',
        price: 0,
        discountPrice: null,
        description: '',
        stock: 0,
        isActive: true,
        imageFile: null
      }
    };
  },
  async created() {
    this.categories = this.loadStoredCategories();
    await Promise.all([this.loadItems(), this.loadOrders(), this.loadCustomers()]);
  },
  methods: {
    loadStoredCategories() {
      if (typeof window === 'undefined') return [];
      try {
        return JSON.parse(window.localStorage.getItem('kauvery-categories') || '[]');
      } catch (err) {
        return [];
      }
    },
    persistCategories() {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kauvery-categories', JSON.stringify(this.categories));
      }
    },
    syncCategories() {
      const fromItems = this.items
        .map(item => (item.category || 'General').trim())
        .filter(Boolean);
      const nextCategories = [...new Set([...this.categories, ...fromItems, 'General'])].sort();
      this.categories = nextCategories;
      this.persistCategories();
    },
    async loadItems() {
      try {
        const res = await api.get('/items');
        this.items = res.data;
        this.syncCategories();
      } catch (err) {
        this.error = 'Unable to load items.';
      }
    },
    async loadOrders() {
      try {
        const res = await api.get('/orders');
        this.orders = res.data;
      } catch (err) {
        this.orders = [];
      }
    },
    async loadCustomers() {
      try {
        const res = await api.get('/users');
        this.customers = res.data.filter(user => !user.isAdmin);
      } catch (err) {
        this.customers = [];
      }
    },
    openAddModal() {
      this.error = null;
      this.success = null;
      this.itemForm = {
        mode: 'add',
        itemId: null,
        name: '',
        categoryOption: this.categories.includes('General') ? 'General' : 'new',
        category: 'General',
        newCategory: '',
        price: 0,
        discountPrice: null,
        description: '',
        stock: 0,
        isActive: true,
        imageFile: null
      };
      this.showItemModal = true;
    },
    startEdit(item) {
      this.error = null;
      this.success = null;
      this.itemForm = {
        mode: 'edit',
        itemId: item.id,
        name: item.name,
        categoryOption: item.category || 'General',
        category: item.category || 'General',
        newCategory: '',
        price: item.price,
        discountPrice: item.discountPrice || null,
        description: item.description,
        stock: item.stock || 0,
        isActive: item.isActive !== false,
        imageFile: null
      };
      this.showItemModal = true;
    },
    closeItemModal() {
      this.showItemModal = false;
      this.itemForm = {
        mode: 'add',
        itemId: null,
        name: '',
        categoryOption: 'General',
        category: 'General',
        newCategory: '',
        price: 0,
        discountPrice: null,
        description: '',
        stock: 0,
        isActive: true,
        imageFile: null
      };
    },
    async submitItem() {
      this.error = null;
      this.success = null;
      const token = store.getState().auth.token;
      if (!token) {
        this.error = 'Please login as admin to add or edit items.';
        return;
      }

      const selectedCategory = this.itemForm.categoryOption === 'new'
        ? this.itemForm.newCategory.trim()
        : this.itemForm.categoryOption;

      if (!selectedCategory) {
        this.error = 'Please choose or create a category.';
        return;
      }

      if (!this.categories.includes(selectedCategory)) {
        this.categories = [...this.categories, selectedCategory].sort();
        this.persistCategories();
      }

      try {
        const formData = new FormData();
        formData.append('name', this.itemForm.name);
        formData.append('category', selectedCategory);
        formData.append('price', Number(this.itemForm.price));
        if (this.itemForm.discountPrice != null) formData.append('discountPrice', Number(this.itemForm.discountPrice));
        formData.append('description', this.itemForm.description || '');
        formData.append('stock', Number(this.itemForm.stock || 0));
        formData.append('isActive', this.itemForm.isActive ? 'true' : 'false');
        if (this.itemForm.imageFile) {
          formData.append('image', this.itemForm.imageFile);
        }

        if (this.itemForm.mode === 'edit') {
          await api.put(`/items/${this.itemForm.itemId}`, formData);
          this.success = 'Item updated successfully.';
        } else {
          await api.post('/items', formData);
          this.success = 'Item added successfully.';
        }

        this.closeItemModal();
        await this.loadItems();
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to save item.';
      }
    },
    async removeItem(itemId) {
      this.error = null;
      this.success = null;
      try {
        await api.delete(`/items/${itemId}`);
        this.success = 'Item deleted successfully.';
        await this.loadItems();
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to delete item.';
      }
    },
    async toggleItemStatus(item) {
      this.error = null;
      this.success = null;
      try {
        await api.put(`/items/${item.id}`, { isActive: item.isActive === false ? true : false });
        this.success = 'Inventory status updated.';
        await this.loadItems();
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to update stock status.';
      }
    },
    async updateOrderStatus(order) {
      this.error = null;
      this.success = null;
      try {
        await api.put(`/orders/${order.id}`, { status: order.status });
        this.success = 'Order status updated.';
        await this.loadOrders();
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to update order.';
      }
    },
    async toggleCustomerBlock(customer) {
      this.error = null;
      this.success = null;
      try {
        await api.put(`/users/${customer.id}`, { isBlocked: !customer.isBlocked });
        this.success = 'Customer status updated.';
        await this.loadCustomers();
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to update customer.';
      }
    },
    async publishOffer() {
      this.offerMessage = null;
      if (!this.offerItemId || this.offerDiscountPrice == null) {
        this.error = 'Please select an item and discount price.';
        return;
      }
      try {
        await api.put(`/items/${this.offerItemId}`, {
          discountPrice: Number(this.offerDiscountPrice)
        });
        this.offerMessage = 'Offer released successfully.';
        this.offerItemId = '';
        this.offerDiscountPrice = null;
        this.showOfferModal = false;
        await this.loadItems();
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to release offer.';
      }
    },
    closeOfferModal() {
      this.showOfferModal = false;
      this.offerItemId = '';
      this.offerDiscountPrice = null;
      this.error = null;
    },
    onItemImageSelect(event) {
      this.itemForm.imageFile = event.target.files[0] || null;
    },
    getItemsForCategory(category) {
      return this.items.filter(item => (item.category || 'General') === category);
    }
  },
  computed: {
    lowStockItems() {
      return this.items.filter(item => Number(item.stock || 0) <= 5);
    },
    pendingOrders() {
      return this.orders.filter(order => (order.status || 'Processing').toLowerCase() !== 'delivered').length;
    },
    revenue() {
      return this.orders.reduce((total, order) => total + Number(order.total || 0), 0);
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
.summary-card,
.offer-card,
.inventory-section,
.modal-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
}
.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 24px;
}
.hero-copy h2 {
  margin: 6px 0;
  color: #0f172a;
}
.hero-copy p {
  margin: 0;
  color: #475569;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 16px;
}
.summary-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.summary-card strong {
  font-size: 1.4rem;
  color: #0f172a;
}
.summary-card span {
  color: #64748b;
}
.operations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.operations-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
  padding: 20px;
}
.card-header {
  margin-bottom: 12px;
}
.card-header h3 {
  margin: 6px 0 0;
  color: #0f172a;
}
.list-stack {
  display: grid;
  gap: 10px;
}
.list-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}
.list-row:last-child {
  border-bottom: none;
}
.list-row p {
  margin: 4px 0 0;
  color: #64748b;
}
.inline-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.inline-select {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 10px;
  font: inherit;
}
.amount-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.8rem;
  font-weight: 700;
}
.small-button {
  padding: 8px 10px;
  font-size: 0.9rem;
}
.item-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.status-pill,
.stock-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}
.status-pill.active,
.stock-pill {
  background: #dcfce7;
  color: #166534;
}
.status-pill.inactive {
  background: #fee2e2;
  color: #b91c1c;
}
.pill {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}
.pill.active {
  background: #dcfce7;
  color: #166534;
}
.pill.blocked {
  background: #fee2e2;
  color: #b91c1c;
}
.empty-state {
  color: #64748b;
  margin: 8px 0 0;
}
.primary-button,
.secondary-button,
.danger-button {
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
  border: 1px solid #cbd5e1;
  background: white;
  color: #0f172a;
}
.danger-button {
  background: #dc2626;
  color: white;
}
.error-message {
  color: #b91c1c;
  background: #fef2f2;
  padding: 12px 14px;
  border-radius: 12px;
}
.success-message {
  color: #047857;
  background: #ecfdf5;
  padding: 12px 14px;
  border-radius: 12px;
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
  width: min(760px, 100%);
  padding: 24px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}
.modal-header h3 {
  margin: 0 0 4px;
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
.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.field input,
.field textarea,
.field select {
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font: inherit;
}
.inline-input {
  margin-top: 8px;
}
.file-info {
  color: #64748b;
  margin: 0;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
.offer-tools,
.inventory-section {
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
}
.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.offer-header h3,
.section-header h3,
.category-title-row h4 {
  margin: 0;
  color: #0f172a;
}
.offer-subtitle,
.category-title-row p,
.item-description {
  color: #64748b;
}
.offer-card {
  margin-top: 16px;
  padding: 18px;
}
.offer-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}
.offer-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.offer-note {
  margin: 0;
  color: #64748b;
}
.category-section {
  margin-top: 20px;
}
.category-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.item-card {
  border-radius: 20px;
  background: white;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}
.item-media {
  min-height: 150px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}
.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.item-image.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #64748b;
  font-weight: 600;
}
.item-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item-top-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.item-top-row h3 {
  margin: 0;
  color: #0f172a;
}
.item-category {
  color: #64748b;
  margin: 4px 0 0;
  text-transform: capitalize;
}
.item-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.8rem;
  font-weight: 700;
  height: fit-content;
}
.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.original-price {
  color: #94a3b8;
  text-decoration: line-through;
}
.discounted-price {
  color: #0f172a;
  font-weight: 700;
}
.item-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
@media (max-width: 640px) {
  .hero-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
