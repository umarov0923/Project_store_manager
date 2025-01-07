// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext, NextFunction } from '../declarations'
import { Conflict, BadRequest } from '@feathersjs/errors'

export const setDefaultRole = async (context: HookContext) => {
  if (!context.data.role) {
    context.data.role = 'owner'; // Устанавливаем значение по умолчанию
  }
}

export const handleDatabaseErrors = async (context: any) => {
  const error = context.error;

  // Проверяем наличие MongoDB ошибки в данных
  if (error.data && error.data.code === 11000) {
    const field = Object.keys(error.data.keyValue)[0];
    const value = error.data.keyValue[field];

    let errorMessage = '';

    switch (field) {
      case 'email':
        errorMessage = `Email ${value} уже зарегистрирован`;
        break;
      default:
        errorMessage = `${field} со значением ${value} уже существует`;
    }

    throw new Conflict(errorMessage, error.data.keyValue);
  }

  return context;
};

export const handleSellerRegistration = async (context: HookContext) => {
  const { data, params, app } = context;

  // Проверяем аутентификацию пользователя
  if (params.user) {
    const user = params.user

    
    // Если пользователь аутентифицирован
    if (user.role == 'owner') {
      // Владелец добавляет продавца в свою компанию
      if (!params.user.companyId) {
        throw new BadRequest('У владельца должен быть указан companyId');
      }

      // Добавляем продавца к компании владельца
      data.companyId = user.companyId;
      data.role = 'seller'; // Устанавливаем роль как продавец
      
    } else {
      throw new BadRequest('Только владелец может добавлять продавцов в компанию');
    }
  } 
  return context;
};

export const updateCompanyAfterSellerCreation = async (context: HookContext) => {
  const { result, app } = context;
  const { companyId } = result;
  console.log('companyId+++++++', companyId);
  

  // Обновляем компанию только если есть companyId
  if (companyId) { 
    try {
      
      const company = await app.service('companies')._get(companyId);
      
      
      // Добавляем нового продавца в массив продавцов компании
      const currentSellers = company.sellers || [];
      
      const updatedSellers = Array.from(new Set([...currentSellers, result._id]));
      

      await app.service('companies')._patch(companyId, {
        sellers: updatedSellers,
      });
      
      // Обновляем результат с информацией о компании
      context.result = {
        ...result,
        company: {
          id: companyId,
          sellerCount: updatedSellers.length
        }
      };

    } catch (error) {
      throw new BadRequest('Не удалось обновить компанию новым продавцом');
    }
  }

  return context;
};