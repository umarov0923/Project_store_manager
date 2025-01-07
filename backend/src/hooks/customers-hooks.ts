import { Forbidden } from '@feathersjs/errors';
import type { HookContext } from '../declarations';
import { log } from 'console';

// Хук для проверки роли и установки companyId
export const validateSellerAndSetCompanyId = async (context: HookContext) => {
  const { user } = context.params; // Текущий пользователь из `params`
  const { data } = context; // Данные, которые будут сохранены
  

  // Проверяем, что пользователь авторизован
  if (!user) {
    throw new Forbidden('You must be authenticated to create a customer.');
  }

  // Проверяем, что пользователь имеет роль продавца
  if (user.role !== 'seller') {
    throw new Forbidden('Only sellers can create customers.');
  }

  // Убеждаемся, что продавец связан с компанией
  if (!user.companyId) {
    throw new Forbidden('You are not associated with any company.');
  }

  // Устанавливаем companyId из данных продавца
  data.companyId = user.companyId;
  data.balance = 0

  return context;
};


export const checkUniqueName = async (context: HookContext) => {
  const { app, data } = context;
  

  if (data.name) {
    
     // Проверяем, существует ли клиент с таким же именем
     const existingClient = await app.service('customers')._find({
        query: {
            name: data.name ,
            companyId: context.params.user.companyId,
           $limit: 1
        }
     });     

     if (existingClient.total > 0) {
        // Если имя занято, выбрасываем ошибку с предложением добавить уточнение
        throw new Error(`Клиент с именем "${data.name}" уже существует. Добавьте уточнение к имени (например, номер или город).`);
     }
  }

  return context;
};



export const filterByCompanyId = async (context: HookContext) => {
  const { params } = context;
  const { user } = params;
  console.log('user:data', user);
  

  if (!params.user || !params.user.companyId) {
    // Если у пользователя нет companyId, возвращаем ошибку или пустой список
    throw new Error('User does not have a companyId');
  }

  context.params.query = {
    ...context.params.query,
    companyId: user.companyId,
  };
  
  return context;
};