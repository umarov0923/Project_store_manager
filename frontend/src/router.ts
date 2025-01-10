import { createRouter, createWebHistory } from 'vue-router';

import Home from './components/Home.vue';
import Registration from "./components/Registration.vue";
import Login from './components/Login.vue';
import CreateCompany from './components/CreateCompany.vue';
import AddSeller from './components/AddSeller.vue';
import AddCustomer from './components/AddCustomer.vue';
import CreateTransaction from './components/CreateTransaction.vue';
import TransactionList from './components/TransactionList.vue';
import  CustomerDebtList  from "./components/CustomerDebtList.vue";



const routes = [
  { path: '/', name: 'Home', component: Home, meta:{ title: 'Главная'} },
  { path: '/registration', component: Registration, meta: { hideMenu: true } },
  { path: '/login', component: Login, meta: { hideMenu: true } },
  { path: '/create-company', component: CreateCompany, meta: {hideMenu: true} },
  { path: '/add-seller', component: AddSeller, },
  { path: '/add-customer', component: AddCustomer },
  { path: '/create-transaction', component: CreateTransaction },
  { path: '/transactions', component: TransactionList },
  { path: '/customer-debts', component: CustomerDebtList },

  // Другие маршруты...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;