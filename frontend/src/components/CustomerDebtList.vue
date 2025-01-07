<template>
  <h1>Список Долгов</h1>
  <!-- Main Content -->
  <div class="main-content">
    <div v-if="loading">Загрузка...</div>

    <!-- Display Customers with Debt -->
    <div v-else>
      <table v-if="customersWithDebt.length">
        <thead>
          <tr>
            <th>Последняя транзакция</th>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Долг</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customersWithDebt" :key="customer._id">
            <td>{{ customer.lastTransaction || 'Нет транзакций' }}</td>
            <td>{{ customer.name }}</td>
            <td>{{ customer.phone }}</td>
            <td>{{ formatBalance(customer.balance) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else>Нет клиентов с долгами</div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">Ошибка при получении данных о клиентах.</div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { API_URL } from '../../src/config';
import router from '../router';

enum PaymentType {
  addDebt = 'Добавить долг',
  payDebt = 'Оплатить долг',
  newPurchase = 'Покупка',
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  balance: number;
  lastTransaction?: string;
}

interface Transaction {
  _id: string;
  date: string;
  description: string;
  amount: number;
  paymentType: keyof typeof PaymentType;
}

export default {
  name: 'CustomerDebtList',
  setup() {
    const customersWithDebt = ref<Customer[]>([]);
    const loading = ref<boolean>(true);
    const error = ref<boolean>(false);

    // Fetch Customers with Debt
    const fetchCustomersWithDebt = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Отправляем запрос на сервер для получения данных о пользователе
        await axios.get(`${API_URL}users/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Обновляем состояние на основе данных с сервера
        try {
          const customersResponse = await axios.get(`${API_URL}customers`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Filter customers with debt
          const customers = customersResponse.data.data.filter((customer: Customer) => customer.balance > 0);

          // Fetch last transaction for each customer in parallel
          const customerTransactions = await Promise.all(
            customers.map((customer: Customer) => getLastTransaction(customer._id, token))
          );

          // Update customers with last transaction
          customers.forEach((customer:Customer, index: number) => {
            customer.lastTransaction = customerTransactions[index];
          });

          customersWithDebt.value = customers;
        } catch (err) {
          error.value = true;
          console.error('Ошибка при получении клиентов:', err);
        } finally {
          loading.value = false;
        }
      } catch (err) {
        console.error('Ошибка при получении данных о пользователе:', err);
        router.push('/login');
      }
    };

    // Fetch Last Transaction for Customer
    const getLastTransaction = async (customerId: string, token: string): Promise<string> => {
      try {
        const response = await axios.get(`${API_URL}transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            customerId, // Фильтруем по customerId
          },
        });

        const customerTransactions: Transaction[] = response.data.data;

        if (customerTransactions.length > 0) {
          const lastTransaction = customerTransactions.reduce((latest, current) =>
            new Date(current.date) > new Date(latest.date) ? current : latest
          );
          return `${lastTransaction.description} - ${lastTransaction.amount.toLocaleString()} "${PaymentType[lastTransaction.paymentType]}" (Дата: ${new Date(lastTransaction.date).toLocaleString()})`;
        } else {
          return 'Нет транзакций';
        }
      } catch (error) {
        console.error('Ошибка при получении транзакции:', error);
        return 'Ошибка';
      }
    };

    // Format Balance
    const formatBalance = (balance: number): string => {
      return balance.toLocaleString();
    };

    // Logout User
    const logout = () => {
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    };

    // Fetch customers data on component mount
    onMounted(() => {
      fetchCustomersWithDebt();
    });

    return {
      customersWithDebt,
      loading,
      error,
      formatBalance,
      logout,
    };
  },
};
</script>
    
<style scoped>
  /* Header */
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #f4f4f4;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .user-icon {
    cursor: pointer;
    font-size: 24px;
  }
  
  /* Sidebar */
  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 250px;
    height: 100%;
    background-color: #f4f4f4;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
    padding: 20px;
    z-index: 1000;
  }
  
  .close-button {
    position: absolute;
    top: 10px;
    left: 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
  
  .menu {
    list-style-type: none;
    padding: 0;
    margin-top: 40px;
  }
  
  .menu-item {
    padding: 10px 20px;
    margin: 5px 0;
    background-color: #f0f0f0;
    border-radius: 5px;
    transition: background-color 0.3s, transform 0.2s;
  }
  
  .menu-item:hover {
    background-color: #e0e0e0;
    transform: scale(1.02);
  }
  
  .menu-item a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
  }
  
  .logout-button {
    padding: 10px 20px;
    margin: 5px 0;
    background-color: #dcdcdc;
    color: #333;
    text-align: center;
    border-radius: 5px;
    font-weight: bold;
    transition: background-color 0.3s, transform 0.2s;
    cursor: pointer;
  }
  
  .logout-button:hover {
    background-color: #cfcfcf;
    transform: scale(1.03);
  }
  
  /* Table */
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
  
  /* Error Message */
  .error-message {
    color: red;
    font-weight: bold;
  }
  </style>
  