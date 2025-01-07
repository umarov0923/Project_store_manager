<template>
  <div>
    <h2>Добавить клиента</h2>
    <form @submit.prevent="addCustomer">
      <div class="form-group">
        <label for="name">Имя:</label>
        <input type="text" id="name" v-model="name" required />
      </div>
      <div class="form-group">
        <label for="phone">Телефон:</label>
        <input type="text" id="phone" v-model="phone" />
      </div>
      <button type="submit" class="submit-button">Добавить клиента</button>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'; 
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_URL } from '../../src/config';

export default {
  name: 'AddCustomer',
  setup() {
    const name = ref('');
    const phone = ref('');
    const errorMessage = ref('');
    const isSidebarOpen = ref(false);
    const isOwner = ref(false);
    const isSeller = ref(false);
    const hasCompany = ref(false);
    const router = useRouter();

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
    };

    const logout = () => {
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
        const response = await axios.get(`${API_URL}users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { role, companyId } = response.data.data[0];
        isOwner.value = role == 'owner';
        isSeller.value = role == 'seller';
        hasCompany.value = companyId !== null && companyId !== undefined;
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        router.push('/login');
      }
    };

    const addCustomer = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        await axios.post(
          `${API_URL}customers`,
          { name: name.value, phone: phone.value },  // Без поля balance
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert('Клиент успешно добавлен!');
        name.value = '';
        phone.value = '';
        errorMessage.value = '';
        router.push('/');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          errorMessage.value = error.response.data.message || 'Ошибка при добавлении клиента.';
        } else {
          errorMessage.value = 'Произошла неизвестная ошибка.';
        }
      }
    };

    // Загружаем данные пользователя при монтировании компонента
    onMounted(() => {
      fetchUserData();
    });

    return {
      name,
      phone,
      errorMessage,
      isSidebarOpen,
      isOwner,
      isSeller,
      hasCompany,
      toggleSidebar,
      logout,
      addCustomer,
    };
  },
};
</script>

<style scoped>
h2 {
  color: #4CAF50;
  margin-bottom: 30px;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  width: 320px; /* Немного увеличиваем ширину формы */
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); /* Легкая тень */
  margin: 50px auto; /* Центрирование формы с отступом сверху */
}

.form-group {
  margin-bottom: 25px; /* Увеличиваем отступ между полями */
}

label {
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

input {
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #4CAF50; /* Цвет фокуса поля */
}

.submit-button {
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #45a049;
}

.submit-button:focus {
  outline: none; /* Убираем стандартное выделение */
  background-color: #388e3c; /* Немного темнее при фокусе */
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 15px;
  text-align: center;
}
</style>
