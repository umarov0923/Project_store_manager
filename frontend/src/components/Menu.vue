<template>
  <div class="menu-container">
    <header class="header">
      <h1>{{ title }}</h1>
      <button 
        class="icon-button"
        @click="toggleSidebar"
        aria-label="Toggle menu"
      >
        <i class="fa-solid fa-bars"></i>
      </button>
    </header>

    <Transition name="slide">
      <aside v-if="isSidebarOpen" class="sidebar">
        <div class="sidebar-header">
          <button 
            class="close-button"
            @click="toggleSidebar"
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>
        
        <nav>
          <ul class="menu">
            <li 
              v-for="item in filteredMenuItems" 
              :key="item.path" 
              class="menu-item"
            >
              <router-link 
                :to="item.path"
                @click="closeSidebar"
                class="menu-link"
              >
                {{ item.label }}
              </router-link>
            </li>
            <li class="menu-item">
              <button 
                @click="handleLogout" 
                class="logout-button"
              >
                Выйти из аккаунта
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </Transition>

    <Transition name="fade">
      <div 
        v-if="isSidebarOpen" 
        class="backdrop"
        @click="closeSidebar"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute} from 'vue-router';
import axios from 'axios';
import { API_URL } from '../config';

// Определяем интерфейс для метаданных маршрута
declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
  }
}

// Types
interface MenuItem {
  path: string;
  label: string;
  condition?: boolean;
}

interface UserData {
  role: 'owner' | 'seller';
  companyId: string | null;
}

// State
const router = useRouter();
const route = useRoute();
const isSidebarOpen = ref(false);
const isOwner = ref(false);
const isSeller = ref(false);
const hasCompany = ref(true);
const title = ref('');

// Methods
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  if (isSidebarOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
  document.body.style.overflow = '';
};

const handleLogout = () => {
  localStorage.removeItem('jwt');
  router.push('/login');
};

const fetchUserData = async () => {
  const token = localStorage.getItem('jwt');
  
  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const response = await axios.get<{ data: UserData[] }>(`${API_URL}users/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { role, companyId } = response.data.data[0];
    isOwner.value = role === 'owner';
    isSeller.value = role === 'seller';
    hasCompany.value = companyId != null;
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error);
    router.push('/login');
  }
};

// Menu items
const menuItems = computed((): MenuItem[] => [
  { path: '/', label: 'Главная' },
  { 
    path: '/create-company', 
    label: 'Добавить компанию', 
    condition: isOwner.value && !hasCompany.value 
  },
  { 
    path: '/create-transaction', 
    label: 'Создать транзакцию', 
    condition: isSeller.value 
  },
  { 
    path: '/add-customer', 
    label: 'Добавить клиента', 
    condition: isSeller.value 
  },
  { 
    path: '/add-seller', 
    label: 'Добавить продавца', 
    condition: isOwner.value && hasCompany.value 
  },
  { 
    path: '/transactions', 
    label: 'Список транзакций', 
    condition: hasCompany.value 
  },
  { 
    path: '/customer-debts', 
    label: 'Список долгов', 
    condition: hasCompany.value 
  },
]);

const filteredMenuItems = computed(() => 
  menuItems.value.filter(item => 
    item.condition !== false && item.path !== route.path
  )
);

// Watchers
watch(
  () => route.meta,
  (newMeta) => {
    title.value = newMeta.title || '';
    document.title = title.value;
  },
  { immediate: true }
);

// Initialize
fetchUserData();
</script>

