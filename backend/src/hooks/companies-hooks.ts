// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext } from '../declarations'
import { Conflict, BadRequest } from '@feathersjs/errors';

export const limitToOneCompanyPerUser = async (context: HookContext) => {
  const { user } = context.params;

  if (!user || !user._id) {
    throw new Error('You must be authenticated to create a company.');
  }

  // Проверяем, есть ли компания, связанная с этим пользователем
  const existingCompany = await context.app.service('companies').find({
    query: {
      ownerId: user._id,
      $limit: 1 // Ограничиваем результат одним документом для оптимизации
    }
  });

  if (existingCompany.total > 0) {
    throw new Error('You can only create one company.');
  }

  return context;
};


export const setDefaultRoleBefore = async (context: HookContext) => {
  const { user } = context.params
  if (user.role == 'owner') {
    // Обновляем роль пользователя на 'owner'
    
    context.data.ownerId = user._id;

  }

  return context;

}


export const setCompanyIdForUser = async (context: HookContext) => {
  const { result, params, app } = context;
  const { user } = params;

  // Проверяем, что у пользователя нет companyId, прежде чем обновлять
  if (!user.companyId) {
    // Обновляем пользователя, присваиваем ему companyId, равное ID компании
    const updatedUser = await app.service('users').patch(user._id, { companyId: result._id });

  }

  return context;
};


// Проверка есть доступ этого компание
export const restrictToOwner = async (context: HookContext) => {
  const { params, id, method } = context;

  // Проверяем наличие params.user (который должен быть установлен после authenticate)
  if (!params?.user) {
    throw new Error('Authentication required');
  }

  const user = params.user;

  // Для операций с конкретным ID проверяем владельца компании
  if (id) {
    try {
      // Используем internal вызов для избежания рекурсии
      const company = await context.app.service('companies')._get(id);

      if (!company) {
        throw new Error('Company not found');
      }

      // Проверяем, является ли пользователь владельцем
      if (company.ownerId.toString() !== user._id.toString()) {
        throw new Error('Access denied: You are not the owner of this company');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  // Для метода find фильтруем по владельцу
  else if (method === 'find') {
    // Добавляем фильтр по ownerId
    context.params.query = {
      ...context.params.query,
      ownerId: user._id
    };
  }

  return context;
};


// Добавление Продовцы

