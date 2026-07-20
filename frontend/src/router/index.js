import { createRouter, createWebHistory } from 'vue-router';
import store from '../store/reduxStore';
import Shop from '../components/Shop.vue';
import Login from '../components/Login.vue';
import Cart from '../components/Cart.vue';
import AdminDashboard from '../components/AdminDashboard.vue';

const routes = [
  { path: '/', component: Shop },
  { path: '/login', component: Login },
  { path: '/cart', component: Cart, meta: { auth: true } },
  { path: '/admin', component: AdminDashboard, meta: { auth: true } }
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to, from, next) => {
  const token = store.getState().auth.token;
  if (to.meta.auth && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/');
  } else {
    next();
  }
});

export default router;
