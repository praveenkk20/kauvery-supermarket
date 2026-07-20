import { createRouter, createWebHistory } from 'vue-router';
import Shop from '../components/Shop.vue';
import Login from '../components/Login.vue';
import Cart from '../components/Cart.vue';
import AdminDashboard from '../components/AdminDashboard.vue';

const routes = [
  { path: '/', component: Shop },
  { path: '/login', component: Login },
  { path: '/cart', component: Cart },
  { path: '/admin', component: AdminDashboard }
];

export default createRouter({ history: createWebHistory(), routes });
