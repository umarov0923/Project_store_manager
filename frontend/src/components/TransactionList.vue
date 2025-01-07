<template>
  <div>
    <h1>Список транзакций</h1>
    <table v-if="transactions.length>0">
      <thead>
        <tr>
          <th>Дата</th>
          <th>Сумма</th>
          <th>Описание</th>
          <th>Тип оплаты</th>
          <th>Клиент</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in transactions" :key="transaction._id">
          <td>{{ formatDate(transaction.date) }}</td>
          <td>{{ transaction.amount }}</td>
          <td>{{ transaction.description }}</td>
          <td>{{ getPaymentType(transaction.paymentType) }}</td> <!-- Выводим тип оплаты -->
          <td>{{ getCustomerName(transaction.customerId) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>Нет транзакций</p>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { API_URL } from '../../src/config';

interface Transaction {
  _id: string;
  date: string;
  amount: number;
  description: string;
  paymentType: string;
  customerId: string;
}

interface Customer {
  _id: string;
  name: string;
}

export default {
  name: 'TransactionList',
  setup() {
    const transactions = ref<Transaction[]>([]);
    const customers = ref<Customer[]>([]);
    const router = useRouter();

    const fetchUserData = async (): Promise<void> => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        await axios.get(`${API_URL}users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        fetchCustomers(token);
        fetchTransactions(token);
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        router.push('/login');
      }
    };

    const fetchCustomers = async (token: string): Promise<void> => {
      try {
        const response = await axios.get<{ data: Customer[] }>(`${API_URL}customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        customers.value = response.data.data || [];
      } catch (error) {
        console.error('Ошибка при получении клиентов:', error);
      }
    };

    const fetchTransactions = async (token: string): Promise<void> => {
      try {
        const response = await axios.get<{ data: Transaction[] }>(`${API_URL}transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        transactions.value = response.data.data || [];
      } catch (error) {
        console.error('Ошибка при получении транзакций:', error);
      }
    };

    const getCustomerName = (customerId: string): string => {
      const customer = customers.value.find((c) => c._id === customerId);
      return customer ? customer.name : 'Неизвестный клиент';
    };

    const getPaymentType = (type: string): string => {
      switch (type) {
        case 'addDebt':
          return 'Долг';
        case 'payDebt':
          return 'Оплата Долга';
        case 'newPurchase':
          return 'Покупка';
        default:
          return 'Неизвестный тип';
      }
    };

    const formatDate = (date: string): string => {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return 'Неизвестная дата';

      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      return parsedDate.toLocaleDateString('ru-RU', options);
    };

    const logout = (): void => {
      localStorage.removeItem('jwt');
      router.push('/login');
    };

    onMounted(() => {
      fetchUserData();
    });

    return {
      transactions,
      customers,
      getCustomerName,
      getPaymentType,
      formatDate,
      logout,
    };
  },
};
</script>


<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}
</style>
