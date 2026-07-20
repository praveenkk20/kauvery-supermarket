import { createRouter, createWebHistory } from 'vue-router';
import store from '../store/reduxStore';
import Shop from '../components/Shop.vue';
import Login from '../components/Login.vue';
import Cart from '../components/Cart.vue';
import AdminDashboard from '../components/AdminDashboard.vue';

const routes = [
  { path: '/', component: Shop },
  { path: '/login', component: Login },
  { path: '/cart', component: Cart, meta: { auth: true, userOnly: true } },
  { path: '/admin', component: AdminDashboard, meta: { auth: true, admin: true } }
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to, from, next) => {
  const auth = store.getState().auth;
  const token = auth.token;
  const isAdmin = auth.user?.isAdmin;

  if (to.meta.auth && !token) {
    next('/login');
  } else if (to.meta.admin && !isAdmin) {
    next('/');
  } else if (to.meta.userOnly && isAdmin) {
    next('/admin');
  } else if (to.path === '/login' && token) {
    next(isAdmin ? '/admin' : '/');
  } else if ((to.path === '/' || to.path === '/cart') && isAdmin) {
    next('/admin');
  } else {
    next();
  }
});

export default router;
