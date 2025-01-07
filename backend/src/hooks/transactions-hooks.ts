import { HookContext } from '@feathersjs/feathers';


export const setTransactionDate = async (context: HookContext) => {
  // Проверяем, если поле `date` не передано в запросе, то добавляем текущую дату
  if (!context.data.date) {
    context.data.date = new Date().toISOString(); // Устанавливаем текущую дату в формате ISO
  }

  return context;
};



export const userIdAdd = async (context:HookContext) => {
  const { user } = context.params;
  const { data } = context;
  
  if (user.role == 'seller'){
    data.userId = user._id
    data.companyId = user.companyId
  }else {
    throw new Error("Только продовец могут делать транзакцию");
    
  }

  return context
}


export const processPaymentType = async (context: HookContext) => {
  const { data, app } = context;
  const { paymentType, amount, customerId } = data;

  if (!customerId) {
    throw new Error('Customer ID is required.');
  }
  
  // Получаем данные клиента
  const customer = await app.service('customers').get(customerId, {
    ...context.params,
 });    
  

  if (!customer) {
    throw new Error('Customer not found.');
  }

  let newBalance = customer.balance;

  // Обрабатываем в зависимости от paymentType
  if (paymentType === 'payDebt') {
    // Погашение долга
    if (customer.balance <= 0) {
      throw new Error('No debt to pay.');
    }

    // Уменьшаем долг на сумму платежа
    newBalance -= amount;

  } else if (paymentType === 'newPurchase') {
    // Независимая покупка (баланс клиента не изменяется)
    // Никаких действий с долгом не требуется

  } else if (paymentType === 'addDebt') {
    // Добавление покупки в долг
    newBalance += amount;
  } else {
    throw new Error('Invalid payment type.');
  }

  // Обновляем баланс клиента
  await app.service('customers').patch(customerId, { balance: newBalance });

  return context;
};


export const filterByCompanyId = async (context: HookContext) => {
  const { params } = context;
  const { user } = params;

  if (!user || !user.companyId) {
    // Если у пользователя нет companyId, возвращаем ошибку или пустой список
    throw new Error('User does not have a companyId');
  }

  context.params.query = {
    ...context.params.query,
    companyId: user.companyId,
  };
  
  return context;
};
