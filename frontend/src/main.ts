// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import '@fortawesome/fontawesome-free/css/all.css';
import router from './router';
import './assets/css/menu.css';

const app = createApp(App);

// Подключаем маршрутизатор
app.use(router);

// Монтируем приложение
app.mount('#app');
