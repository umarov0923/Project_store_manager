import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { API_URL } from '../config';

// Определяем интерфейсы
interface UserData {
  role: 'owner' | 'seller';
  companyId: string | null;
  email?: string;
  id?: string;
}

interface ApiResponse {
  data: UserData[];
  message?: string;
}

export const useUserState = () => {
  // Состояния
  const isOwner = ref<boolean>(false);
  const isSeller = ref<boolean>(false);
  const hasCompany = ref<boolean>(false);
  const userData = ref<UserData | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  
  const router = useRouter();

  // Основная функция для получения данных пользователя
  const fetchUserData = async (): Promise<boolean> => {
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      error.value = 'Не найден токен авторизации';
      router.push('/login');
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get<ApiResponse>(`${API_URL}users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.data.length) {
        throw new Error('Данные пользователя не найдены');
      }

      const user = response.data.data[0];
      
      // Обновляем состояния
      userData.value = user;
      isOwner.value = user.role === 'owner';
      isSeller.value = user.role === 'seller';
      hasCompany.value = user.companyId !== null;

      return true;

    } catch (e) {
      if (axios.isAxiosError(e)) {
        error.value = e.response?.data?.message || 'Ошибка при загрузке данных пользователя';
        
        if (e.response?.status === 401) {
          localStorage.removeItem('jwt');
          router.push('/login');
        }
      } else {
        error.value = 'Неизвестная ошибка при загрузке данных пользователя';
      }
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Функция для очистки состояния
  const clearUserState = () => {
    isOwner.value = false;
    isSeller.value = false;
    hasCompany.value = false;
    userData.value = null;
    error.value = null;
  };

  // Функция для выхода из системы
  const logout = () => {
    localStorage.removeItem('jwt');
    clearUserState();
    router.push('/login');
  };

  // Функция для проверки авторизации
  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      clearUserState();
      return false;
    }
    return await fetchUserData();
  };

  return {
    // Состояния
    isOwner,
    isSeller,
    hasCompany,
    userData,
    loading,
    error,

    // Методы
    fetchUserData,
    clearUserState,
    logout,
    checkAuth
  };
};