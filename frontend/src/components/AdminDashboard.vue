<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Admin Dashboard</h2>
    <form @submit.prevent="addItem" class="bg-white p-4 rounded shadow max-w-md">
      <input v-model="name" placeholder="Name" class="border p-2 w-full mb-2" />
      <input v-model="price" placeholder="Price" class="border p-2 w-full mb-2" />
      <textarea v-model="description" placeholder="Description" class="border p-2 w-full mb-2"></textarea>
      <button class="bg-green-600 text-white px-3 py-1 rounded">Add Item</button>
    </form>
    <div class="mt-4">
      <h3 class="font-medium">Existing items</h3>
      <ul>
        <li v-for="it in items" :key="it.id">{{ it.name }} — ₹{{ it.price }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import store from '../store/reduxStore';

export default {
  data() { return { name: '', price: 0, description: '', items: [] } },
  async created() {
    const res = await axios.get('http://localhost:4000/items');
    this.items = res.data;
  },
  methods: {
    async addItem() {
      const token = store.getState().auth.token;
      if (!token) return alert('Login as admin');
      await axios.post('http://localhost:4000/items', { name: this.name, price: Number(this.price), description: this.description }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Added');
    }
  }
}
</script>
