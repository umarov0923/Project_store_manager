import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import { ObjectIdSchema } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import type { TransactionsService } from './transactions.class';

// Основная схема данных транзакций
export const transactionsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    amount: Type.Number({ minimum: 0 }), // Сумма транзакции
    date: Type.String({ format: 'date-time' }), // Дата транзакции
    userId: ObjectIdSchema(), // Продавец
    companyId: ObjectIdSchema(), // Компания
    customerId: ObjectIdSchema(), // Покупатель
    paymentType: Type.String({ enum: ['payDebt', 'newPurchase', 'addDebt'] }), // Тип оплаты
    description: Type.Optional(Type.String()), // Описание
  },
  { $id: 'Transactions', additionalProperties: false }
);
export type Transactions = Static<typeof transactionsSchema>;
export const transactionsValidator = getValidator(transactionsSchema, dataValidator);
export const transactionsResolver = resolve<Transactions, HookContext<TransactionsService>>({});

export const transactionsExternalResolver = resolve<Transactions, HookContext<TransactionsService>>({});

// Схема для создания новых записей
export const transactionsDataSchema = Type.Pick(transactionsSchema, ['amount', 'customerId', 'paymentType', 'userId', 'companyId', 'description'], {
  $id: 'TransactionsData'
});
export type TransactionsData = Static<typeof transactionsDataSchema>;
export const transactionsDataValidator = getValidator(transactionsDataSchema, dataValidator);
export const transactionsDataResolver = resolve<Transactions, HookContext<TransactionsService>>({});

// Схема для обновления записей
export const transactionsPatchSchema = Type.Partial(transactionsSchema, {
  $id: 'TransactionsPatch'
});
export type TransactionsPatch = Static<typeof transactionsPatchSchema>;
export const transactionsPatchValidator = getValidator(transactionsPatchSchema, dataValidator);
export const transactionsPatchResolver = resolve<Transactions, HookContext<TransactionsService>>({});

// Схема для разрешённых свойств в запросах
export const transactionsQueryProperties = Type.Pick(transactionsSchema, ['_id', 'customerId', 'paymentType', 'date']);
export const transactionsQuerySchema = Type.Intersect(
  [
    querySyntax(transactionsQueryProperties),
    // Добавьте дополнительные свойства для запросов, если нужно
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
);
export type TransactionsQuery = Static<typeof transactionsQuerySchema>;
export const transactionsQueryValidator = getValidator(transactionsQuerySchema, queryValidator);
export const transactionsQueryResolver = resolve<TransactionsQuery, HookContext<TransactionsService>>({});
