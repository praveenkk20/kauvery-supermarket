import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/reduxStore';

const app = createApp(App);
app.use(router);
// Attach Redux store to Vue globalProperties for components to access via this.$store
app.config.globalProperties.$store = store;

app.mount('#app');
