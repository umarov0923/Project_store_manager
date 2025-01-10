<template>
  <div class="create-company-container">
    <h2>Create Company</h2>
    <form @submit.prevent="createCompany" class="company-form">
      <input
        v-model="companyName"
        type="text"
        placeholder="Company Name"
        class="input-field"
      />
      <button type="submit" :disabled="isSubmitting" class="submit-button">
        Create Company
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { API_URL } from '../../src/config';

export default {
  setup() {
    const companyName = ref('');
    const isSubmitting = ref(false); // Для блокировки кнопки отправки
    const router = useRouter();
    const hasCompany = ref(false); // Флаг наличия компании

    // Проверяем наличие компании у пользователя при монтировании компонента
    onMounted(async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        alert('Please log in first');
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { companyId } = response.data.data[0];
        hasCompany.value = companyId !== null && companyId !== undefined;

        // Если компания уже есть, перенаправляем на главную страницу
        if (hasCompany.value) {
          router.push('/');
        }
      } catch (err) {
        console.error('Error fetching user data', err);
        alert('Error fetching user data');
        router.push('/login');
      }
    });

    const createCompany = async () => {
      if (!companyName.value.trim()) {
        alert('Company name is required');
        return;
      }

      const token = localStorage.getItem('jwt');
      if (!token) {
        alert('Please log in first');
        return;
      }

      isSubmitting.value = true;

      try {
        await axios.post(
          `${API_URL}companies`,
          { name: companyName.value },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Company created successfully!');
        router.replace('/add-seller');
      } catch (err) {
        console.error('Error creating company', err);
        alert('Error creating company');
      } finally {
        isSubmitting.value = false;
      }
    };

    return { companyName, createCompany, isSubmitting };
  }
};
</script>

<style scoped>
.create-company-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f4f4f4;
  padding: 20px;
}

h2 {
  font-size: 24px;
  color: #4caf50;
  margin-bottom: 20px;
}

.company-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.input-field {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 20px;
}

.submit-button {
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.submit-button:disabled {
  background-color: #dcdcdc;
  cursor: not-allowed;
}

.submit-button:hover {
  background-color: #45a049;
}


</style>
