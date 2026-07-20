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
        <label>Category</label>
        <input v-model="category" placeholder="Category" required />
      </div>
      <div class="field">
        <label>Price</label>
        <input v-model.number="price" type="number" placeholder="Price" required />
      </div>
      <div class="field">
        <label>Discount price</label>
        <input v-model.number="discountPrice" type="number" placeholder="Discounted price (optional)" />
      </div>
      <div class="field">
        <label>Description</label>
        <textarea v-model="description" placeholder="Description"></textarea>
      </div>
      <div class="field">
        <label>Product image</label>
        <input type="file" @change="onImageSelect" accept="image/*" />
        <p v-if="imageFile" class="file-info">Selected: {{ imageFile.name }}</p>
      </div>
      <button class="primary-button">Add Item</button>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">{{ success }}</div>
    </form>

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

    <div class="items-list">
      <article v-for="it in items" :key="it.id" class="item-card">
        <div class="item-card-top">
          <div class="item-media">
            <img v-if="it.imageUrl" :src="it.imageUrl" alt="Product image" class="item-image" />
            <div v-else class="item-image placeholder">No image</div>
          </div>
          <div class="admin-item-row">
            <div>
              <h3>{{ it.name }}</h3>
              <p class="item-category">{{ it.category || 'General' }}</p>
              <p>{{ it.description }}</p>
            </div>
            <div>
              <span v-if="it.discountPrice && it.discountPrice < it.price" class="item-badge">Sale</span>
              <div class="price-row">
                <span v-if="it.discountPrice && it.discountPrice < it.price" class="original-price">₹{{ it.price.toFixed(2) }}</span>
                <strong class="discounted-price">₹{{ (it.discountPrice && it.discountPrice < it.price) ? it.discountPrice.toFixed(2) : it.price.toFixed(2) }}</strong>
              </div>
            </div>
          </div>
          <div class="item-actions">
            <button class="secondary-button" @click="startEdit(it)">Edit</button>
            <button class="danger-button" @click="removeItem(it.id)">Delete</button>
          </div>
        </div>

        <form v-if="editingItemId === it.id" @submit.prevent="saveItem(it.id)" class="edit-form">
          <div class="field">
            <label>Name</label>
            <input v-model="editName" required />
          </div>
          <div class="field">
            <label>Category</label>
            <input v-model="editCategory" placeholder="Category" required />
          </div>
          <div class="field">
            <label>Price</label>
            <input v-model.number="editPrice" type="number" required />
          </div>
          <div class="field">
            <label>Discount price</label>
            <input v-model.number="editDiscountPrice" type="number" />
          </div>
          <div class="field">
            <label>Description</label>
            <textarea v-model="editDescription"></textarea>
          </div>
          <div class="edit-actions">
            <button type="submit" class="primary-button">Save</button>
            <button type="button" class="secondary-button" @click="cancelEdit">Cancel</button>
          </div>
        </form>
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
      category: 'General',
      price: 0,
      discountPrice: null,
      description: '',
      imageFile: null,
      items: [],
      error: null,
      success: null,
      editingItemId: null,
      editName: '',
      editCategory: 'General',
      editPrice: 0,
      editDiscountPrice: null,
      editDescription: '',
      editImageFile: null,
      offerItemId: '',
      offerDiscountPrice: null,
      offerMessage: null,
      showOfferModal: false
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
        const formData = new FormData();
        formData.append('name', this.name);
        formData.append('category', this.category);
        formData.append('price', Number(this.price));
        if (this.discountPrice != null) formData.append('discountPrice', Number(this.discountPrice));
        formData.append('description', this.description);
        if (this.imageFile) {
          formData.append('image', this.imageFile);
        }

        await api.post('/items', formData);
        this.success = 'Item added successfully.';
        this.name = '';
        this.category = 'General';
        this.price = 0;
        this.discountPrice = null;
        this.description = '';
        this.imageFile = null;
        await this.loadItems();
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to add item.';
      }
    },
    startEdit(item) {
      this.editingItemId = item.id;
      this.editName = item.name;
      this.editCategory = item.category || 'General';
      this.editPrice = item.price;
      this.editDiscountPrice = item.discountPrice || null;
      this.editDescription = item.description;
      this.error = null;
      this.success = null;
    },
    cancelEdit() {
      this.editingItemId = null;
      this.editName = '';
      this.editCategory = 'General';
      this.editPrice = 0;
      this.editDiscountPrice = null;
      this.editDescription = '';
    },
    async saveItem(itemId) {
      this.error = null;
      this.success = null;
      try {
        const formData = new FormData();
        formData.append('name', this.editName);
        formData.append('category', this.editCategory);
        formData.append('price', Number(this.editPrice));
        if (this.editDiscountPrice != null) formData.append('discountPrice', Number(this.editDiscountPrice));
        formData.append('description', this.editDescription);
        if (this.editImageFile) {
          formData.append('image', this.editImageFile);
        }

        await api.put(`/items/${itemId}`, formData);
        this.success = 'Item updated successfully.';
        this.cancelEdit();
        this.editImageFile = null;
        await this.loadItems();
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to update item.';
      }
    },
    async removeItem(itemId) {
      this.error = null;
      this.success = null;
      try {
        await api.delete(`/items/${itemId}`);
        this.success = 'Item deleted successfully.';
        if (this.editingItemId === itemId) this.cancelEdit();
        await this.loadItems();
      } catch (err) {
        this.error = err.response?.data?.error || 'Unable to delete item.';
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
    onImageSelect(event) {
      this.imageFile = event.target.files[0] || null;
    },
    onEditImageSelect(event) {
      this.editImageFile = event.target.files[0] || null;
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
.admin-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.item-card h3 {
  margin: 0 0 10px;
}
.price-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.original-price {
  color: #94a3b8;
  text-decoration: line-through;
}
.discounted-price {
  color: #0f172a;
  font-weight: 700;
}
.offer-header h3 {
  margin: 0;
  font-size: 1.25rem;
}
.offer-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 999px;
  background: #c7d2fe;
  color: #312e81;
  font-weight: 700;
}
.offer-subtitle {
  color: #475569;
  margin: 10px 0 0;
  line-height: 1.6;
}
.offer-card {
  padding: 24px;
  border-radius: 22px;
  background: #f8fafc;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 16px;
}
.offer-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}
.offer-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.offer-note {
  color: #6b7280;
  font-size: 0.95rem;
}
.offer-status {
  color: #047857;
  font-weight: 600;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}
.modal-panel {
  width: min(720px, 100%);
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.18);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 20px;
}
.modal-header h3 {
  margin: 0;
}
.modal-close {
  border: none;
  background: transparent;
  color: #334155;
  font-size: 1.6rem;
  cursor: pointer;
  line-height: 1;
}
.modal-form {
  display: grid;
  gap: 18px;
}
.modal-actions {
  justify-content: flex-end;
}
.secondary-button {
  border: 1px solid #cbd5e1;
  background: white;
  color: #0f172a;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
}
.danger-button {
  border: none;
  border-radius: 12px;
  background: #dc2626;
  color: white;
  padding: 12px 16px;
  cursor: pointer;
}
.item-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0c4a6e;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.error-message {
  color: #b91c1c;
}
.success-message {
  color: #047857;
}
</style>
