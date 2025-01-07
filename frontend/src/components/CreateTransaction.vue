<template>
  <div class="form-container">
    <h1>Создать транзакцию</h1>
    <form @submit.prevent="submitTransaction">
      <div class="form-group">
        <label for="amount">Сумма:</label>
        <input 
          type="text" 
          v-model="formattedAmount" 
          @input="formatAmount" 
          required 
          min="0"
          placeholder="Введите сумму"
        />
      </div>
      <div class="form-group">
        <label for="description">Описание:</label>
        <input type="text" v-model="description" required placeholder="Введите описание" />
      </div>
      <div class="form-group">
        <label for="paymentType">Тип оплаты:</label>
        <select v-model="paymentType" required>
          <option value="addDebt">Добавить долг</option>
          <option value="payDebt">Оплатить долг</option>
          <option value="newPurchase">Покупка</option>
        </select>
      </div>
      <div class="form-group">
        <label for="customerId">Выберите клиента:</label>
        <select v-model="customerId" required>
          <option v-for="customer in customers" :key="customer._id" :value="customer._id">
            {{ customer.name }} - {{ formatBalance(customer.balance) }}
          </option>
        </select>
      </div>
      <button type="submit" :disabled="isSubmitting || !isValidForm">Создать транзакцию</button>
    </form>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="isLoading" class="loading-message">Загрузка...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_URL } from '../../src/config';

interface Customer {
  _id: string;
  name: string;
  balance: number;
}

interface Transaction {
  amount: number;
  description: string;
  paymentType: string;
  customerId: string;
}

export default defineComponent({
  name: 'CreateTransaction',
  setup() {
    const amount = ref<number>(0);
    const formattedAmount = ref<string>(''); // оставляем строку для ввода
    const description = ref<string>('');
    const paymentType = ref<string>('addDebt');
    const customerId = ref<string>('');
    const customers = ref<Customer[]>([]);
    const errorMessage = ref<string>('');
    const isSubmitting = ref<boolean>(false);
    const isLoading = ref<boolean>(false);
    const router = useRouter();

    const isValidForm = computed(() => {
      return formattedAmount.value !== '' && description.value !== '' && customerId.value !== '';
    });

    const fetchCustomers = async () => {
      isLoading.value = true;
      const token = localStorage.getItem('jwt');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get<{ data: Customer[] }>(`${API_URL}customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        customers.value = response.data.data;
      } catch (error) {
        errorMessage.value = 'Не удалось загрузить клиентов. Пожалуйста, попробуйте снова.';
      } finally {
        isLoading.value = false;
      }
    };

    const submitTransaction = async () => {
      if (!isValidForm.value) {
        return;
      }

      isSubmitting.value = true;
      const transactionData: Transaction = {
        amount: parseFloat(formattedAmount.value.replace(/[^0-9.]/g, '')),
        description: description.value,
        paymentType: paymentType.value,
        customerId: customerId.value,
      };

      try {
        await axios.post(`${API_URL}transactions`, transactionData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          },
        });
        router.push('/transactions');
      } catch (error) {
        console.error('Ошибка при создании транзакции:', error);
        errorMessage.value = 'Не удалось создать транзакцию. Пожалуйста, попробуйте снова.';
      } finally {
        isSubmitting.value = false;
      }
    };

    const formatAmount = () => {
      let rawAmount = formattedAmount.value.replace(/[^0-9]/g, ''); // Убираем все, кроме цифр
      formattedAmount.value = rawAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Форматируем с пробелами
      amount.value = parseFloat(rawAmount) || 0; // Обновляем числовое значение
    };

    const formatBalance = (balance: number) => {
      return balance.toLocaleString(); // Форматируем баланс клиента с разделением на тысячи
    };

    onMounted(() => {
      fetchCustomers();
    });

    return {
      formattedAmount,
      description,
      paymentType,
      customerId,
      customers,
      submitTransaction,
      formatAmount,
      formatBalance,
      errorMessage,
      isSubmitting,
      isLoading,
      isValidForm,
    };
  },
});
</script>

<style scoped>
.form-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 50px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
}

form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

label {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

input,
select {
  padding: 12px 15px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  width: 100%;
  background: #fff;
  transition: all 0.3s ease;
}

input:focus,
select:focus {
  border-color: #4CAF50;
  outline: none;
}

input::placeholder,
select::placeholder {
  color: #888;
}

button {
  padding: 12px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 20px;
  font-size: 14px;
}

.loading-message {
  color: blue;
  margin-top: 20px;
  font-size: 14px;
}
</style>
