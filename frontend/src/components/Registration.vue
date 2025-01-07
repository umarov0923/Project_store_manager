<template>
  <div class="registration-container">
    <h2>Регистрация</h2>
    <form @submit.prevent="register" class="registration-form">
      <input v-model="email" type="email" placeholder="Email" required class="input-field" />
      <input v-model="password" type="password" placeholder="Пароль" required class="input-field" />
      <button type="submit" class="submit-button">Зарегистрироваться</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
    <router-link to="/login" class="login-link">Уже есть аккаунт? Войти</router-link>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../../src/config';

interface APIErrorResponse {
  message: string;
}

export default {
  name: 'Registration',
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref('');

    const register = async () => {
      try {
        await axios.post(`${API_URL}users`, {
          email: email.value,
          password: password.value,
        });
        email.value = '';
        password.value = '';
        alert('Регистрация прошла успешно! Пожалуйста, войдите.');
        window.location.href = '/login';
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<APIErrorResponse>;
          error.value = axiosError.response?.data.message || 'Ошибка при регистрации';
        } else {
          error.value = 'Произошла непредвиденная ошибка. Попробуйте позже.';
        }
      }
    };

    return { email, password, error, register };
  },
};
</script>

<style scoped>
.registration-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f4f4f4;
}

h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 1.8rem;
  text-align: center;
}

.registration-form {
  display: flex;
  flex-direction: column;
  width: 320px;
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.input-field {
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 15px;
  width: 100%;
  transition: border-color 0.3s ease;
}

.input-field:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

.submit-button {
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #45a049;
}

.error {
  color: red;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}

.login-link {
  margin-top: 15px;
  color: #4CAF50;
  text-decoration: none;
  text-align: center;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
