  import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import { ObjectIdSchema } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import type { CustomersService } from './customers.class';

// Основная схема данных покупателя
export const customersSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String({ maxLength: 100 }), // Имя покупателя
    phone: Type.Optional(Type.String({ maxLength: 15 })), // Телефон
    balance: Type.Number({ default: 0, minimum: 0 }), // Баланс (долг покупателя)
    companyId: ObjectIdSchema(), //ID компании, к которой принадлежит покупатель
    createdAt: Type.Optional(Type.String({ format: 'date-time' })), // Дата создания
    updatedAt: Type.Optional(Type.String({ format: 'date-time' })), // Дата обновления
  },
  { $id: 'Customers', additionalProperties: false }
);

export type Customers = Static<typeof customersSchema>;
export const customersValidator = getValidator(customersSchema, dataValidator);
export const customersResolver = resolve<Customers, HookContext<CustomersService>>({});

export const customersExternalResolver = resolve<Customers, HookContext<CustomersService>>({});

// Схема для создания новых записей
export const customersDataSchema = Type.Pick(customersSchema, ['name', 'phone', 'companyId', 'balance'], {
  $id: 'CustomersData',
});
export type CustomersData = Static<typeof customersDataSchema>;
export const customersDataValidator = getValidator(customersDataSchema, dataValidator);
export const customersDataResolver = resolve<Customers, HookContext<CustomersService>>({});

// Схема для обновления записей
export const customersPatchSchema = Type.Partial(customersSchema, {
  $id: 'CustomersPatch',
});
export type CustomersPatch = Static<typeof customersPatchSchema>;
export const customersPatchValidator = getValidator(customersPatchSchema, dataValidator);
export const customersPatchResolver = resolve<Customers, HookContext<CustomersService>>({});

// Схема для разрешённых свойств в запросах
export const customersQueryProperties = Type.Pick(customersSchema, ['_id', 'name', 'balance', 'companyId']);
export const customersQuerySchema = Type.Intersect(
  [
    querySyntax(customersQueryProperties),
    // Дополнительные свойства для запросов, если нужно
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false }
);

export type CustomersQuery = Static<typeof customersQuerySchema>;
export const customersQueryValidator = getValidator(customersQuerySchema, queryValidator);
export const customersQueryResolver = resolve<CustomersQuery, HookContext<CustomersService>>({});
