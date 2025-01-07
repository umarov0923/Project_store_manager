<template>
  <div v-if="companyName">
    <h1>Статистика по компании (по дням)</h1>
    <h2>{{ companyName }}</h2>
    <!-- Ошибка при загрузке данных -->
    <div v-if="errorMessage" class="error">
      <p>{{ errorMessage }}</p>
    </div>

    <!-- Таблица статистики по дням -->
    <table v-if="Object.keys(dailyStats).length > 0" border="1">
      <thead>
        <tr>
          <th>Дата</th>
          <th>Количество транзакций</th>
          <th>Долг</th>
          <th>Оплата Долг</th>
          <th>Покупка</th>
          <th>Общий объем продаж</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(stats, date) in dailyStats" :key="date">
          <td>{{ date }}</td>
          <td>{{ stats.numberOfTransactions }}</td>
          <td>{{ formatSum(stats.totalDebt) }}</td>
          <td>{{ formatSum(stats.totalDebtPayment) }}</td>
          <td>{{ formatSum(stats.totalPurchase) }}</td>
          <td>{{ formatSum(stats.totalSales) }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else>
      <p>Нет данных для отображения.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { API_URL } from '../../src/config';

export default {
  name: 'MainPage',
  setup() {
    const dailyStats = ref<any>({}); // Для хранения статистики по дням
    const errorMessage = ref<string | null>(null); // Для хранения сообщений об ошибках
    const router = useRouter();
    const companyName = ref('');

    // Функция для загрузки статистики по компании
    const fetchCompanyStats = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Получаем данные о текущем пользователе
        const userResponse = await axios.get(`${API_URL}users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = userResponse.data.data[0]; // Данные о текущем пользователе
        const companyId = user.companyId; // ID компании текущего пользователя

        // Получаем данные о компании
        const companyResponse = await axios.get(`${API_URL}companies`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Находим компанию текущего пользователя
        const company = companyResponse.data.data.find((company: any) => company._id === companyId);
        if (!company) {
          throw new Error('Ваша компания не найдена');
        }
        companyName.value = company.name;

        // Получаем транзакции компании
        const transactionsResponse = await axios.get(`${API_URL}transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const transactions = transactionsResponse.data.data;

        // Группируем транзакции по дате и типу
        const groupedByDate = transactions.reduce((acc: any, transaction: any) => {
          const date = new Date(transaction.date).toLocaleDateString(); // Преобразуем в строку локального времени

          if (!acc[date]) {
            acc[date] = {
              numberOfTransactions: 0,
              totalSales: 0,
              totalDebt: 0,
              totalDebtPayment: 0,
              totalPurchase: 0,
            };
          }

          // Добавляем информацию о транзакции
          acc[date].numberOfTransactions++; // Увеличиваем количество транзакций
          acc[date].totalSales += transaction.amount; // Суммируем общую сумму

          // Обработка различных типов транзакций
          if (transaction.paymentType === 'addDebt') {
            acc[date].totalDebt += transaction.amount;
          } else if (transaction.paymentType === 'payDebt') {
            acc[date].totalDebtPayment += transaction.amount;
            acc[date].totalSales -= transaction.amount; // Вычитаем сумму оплаты долга из общей суммы
          } else if (transaction.paymentType === 'newPurchase') {
            acc[date].totalPurchase += transaction.amount;
          }


          return acc;
        }, {});


        // Обновляем статистику по дням
        dailyStats.value = groupedByDate;

      } catch (error) {
        errorMessage.value = 'Ошибка при загрузке данных компании или транзакций.';
        console.error(error);
      }
    };

    // Запрос статистики при монтировании компонента
    onMounted(() => {
      fetchCompanyStats();
    });

    // Функция для форматирования сумм
    const formatSum = (sum: number) => {
      // Округление до целых чисел и форматирование
      return Math.round(sum).toLocaleString() + ' UZS'; // Добавляем "UZS" в конце
    };

    return {
      dailyStats,
      errorMessage,
      formatSum,
      companyName,
    };
  },
};
</script>

<style scoped>
.error {
  color: red;
}

h1, h2 {
  text-align: center;
}

h2 {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

table th, table td {
  padding: 10px;
  text-align: left;
}

table th {
  background-color: #f4f4f4;
}

table tr:nth-child(even) {
  background-color: #f9f9f9;
}

table tr:hover {
  background-color: #f1f1f1;
}
</style>
