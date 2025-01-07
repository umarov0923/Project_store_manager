// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Customers,
  CustomersData,
  CustomersPatch,
  CustomersQuery,
  CustomersService
} from './customers.class'

export type { Customers, CustomersData, CustomersPatch, CustomersQuery }

export type CustomersClientService = Pick<
  CustomersService<Params<CustomersQuery>>,
  (typeof customersMethods)[number]
>

export const customersPath = 'customers'

export const customersMethods: Array<keyof CustomersService> = ['find', 'get', 'create', 'patch', 'remove']

export const customersClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(customersPath, connection.service(customersPath), {
    methods: customersMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [customersPath]: CustomersClientService
  }
}
