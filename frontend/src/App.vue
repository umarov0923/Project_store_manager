<template>
  <div>
    <!-- Показываем меню только на страницах, где оно нужно -->
    <Menu v-if="!$route.meta.hideMenu" />
    <router-view />
  </div>
</template>

<script>
import Menu from './components/Menu.vue';

export default {
  components: {
    Menu,
  },
};
</script>
