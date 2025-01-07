<template>
  <div class="add-seller-container">
    <h2>Добавить продавца</h2>
    <form @submit.prevent="addSeller" v-if="hasCompany">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required :class="{'input-error': email && !isValidEmail(email)}" />
        <span v-if="email && !isValidEmail(email)" class="error-text">Введите корректный email.</span>
      </div>
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit" class="submit-button" :disabled="isSubmitting || !isValidEmail(email)">Добавить продавца</button>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <router-link to="/" class="back-link">Назад к Главной странице</router-link>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_URL } from '../../src/config';

export default {
  name: 'AddSeller',
  setup() {
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const isSubmitting = ref(false);
    const hasCompany = ref<boolean>(true);
    const router = useRouter();

    // Проверка на валидность email
    const isValidEmail = (email: string) => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      return regex.test(email);
    };

    // Функция для проверки, есть ли у пользователя компания
    const checkCompany = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        router.push('/login');
        return false;
      }

      try {
        const response = await axios.get(`${API_URL}users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data.data[0].companyId) {
          router.push('/create-company');
          return false;
        }

        return true;
      } catch (error) {
        console.error('Ошибка при проверке компании', error);
        router.push('/create-company');
        return false;
      }
    };

    onMounted(async () => {
      const result = await checkCompany();
      hasCompany.value = result;
    });

    const addSeller = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        isSubmitting.value = true;
        await axios.post(
          `${API_URL}users`,
          { email: email.value, password: password.value },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert('Продавец успешно добавлен!');
        email.value = '';
        password.value = '';
        errorMessage.value = '';

        // Перенаправляем на главную страницу, обновляем компоненты без перезагрузки
        router.replace('/');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          errorMessage.value = error.response.data.message || 'Ошибка при добавлении продавца.';
        } else {
          errorMessage.value = 'Произошла неизвестная ошибка.';
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      email,
      password,
      errorMessage,
      isSubmitting,
      addSeller,
      hasCompany,
      isValidEmail,
    };
  },
};
</script>

<style scoped>
.add-seller-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: calc(100vh - 30px); /* Увеличиваем пространство для контейнера */
  padding: 40px 20px; /* Увеличиваем отступы вокруг формы */
  margin-top: 30px; /* Добавляем отступ сверху */
}

h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 2rem; /* Увеличиваем размер заголовка */
}

form {
  display: flex;
  flex-direction: column;
  width: 350px; /* Увеличиваем ширину формы */
  padding: 30px; /* Увеличиваем внутренний отступ формы */
  border-radius: 10px; /* Увеличиваем радиус скругления */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Легкая тень */
}

.form-group {
  margin-bottom: 15px;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  transition: all 0.3s;
}

input:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
}

.input-error {
  border-color: red;
}

.error-text {
  color: red;
  font-size: 12px;
}

.submit-button {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.submit-button:disabled {
  background-color: #dcdcdc;
  cursor: not-allowed;
}

.submit-button:hover:not(:disabled) {
  background-color: #45a049;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

.back-link {
  margin-top: 20px;
  color: #4CAF50;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
