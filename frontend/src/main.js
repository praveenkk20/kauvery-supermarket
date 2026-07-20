import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/reduxStore';

const app = createApp(App);
app.use(router);
app.config.globalProperties.$store = store;

app.mount('#app');
