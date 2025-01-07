<template>
  <div class="login-container">
    <h1>Вход</h1>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" id="email" required />
      </div>
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" v-model="password" id="password" required />
      </div>
      <button type="submit" class="login-button">Войти</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
    <router-link to="/registration" class="registration-link">Регистрация</router-link>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_URL } from '../../src/config';

export default {
  name: 'Login',
  setup() {
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const router = useRouter();

    const login = async () => {
      try {
        const response = await axios.post(`${API_URL}authentication`, {
          strategy: 'local',
          email: email.value,
          password: password.value,
        });

        localStorage.setItem('jwt', response.data.accessToken);
        alert('Login successful!');
        router.push('/');
      } catch (error) {
        errorMessage.value = 'Invalid email or password';
      }
    };

    return { email, password, errorMessage, login };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0; /* Светло-серый фон для мягкости */
}

h1 {
  color: #4CAF50;
  margin-bottom: 30px;
  font-size: 2rem;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  width: 320px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

input {
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 100%;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #4CAF50; /* Цвет фокуса */
  outline: none;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
}

.login-button {
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #45a049;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 15px;
  text-align: center;
}

.registration-link {
  margin-top: 20px;
  text-align: center;
  color: #4CAF50;
  font-size: 14px;
  text-decoration: none;
}

.registration-link:hover {
  text-decoration: underline;
}
</style>
