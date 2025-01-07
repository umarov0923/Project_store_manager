// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Customers, CustomersData, CustomersPatch, CustomersQuery } from './customers.schema'

export type { Customers, CustomersData, CustomersPatch, CustomersQuery }

export interface CustomersParams extends MongoDBAdapterParams<CustomersQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class CustomersService<ServiceParams extends Params = CustomersParams> extends MongoDBService<
  Customers,
  CustomersData,
  CustomersParams,
  CustomersPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('customers'))
  }
}
