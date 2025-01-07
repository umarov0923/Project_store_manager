import { customers } from './customers/customers'
import { transactions } from './transactions/transactions'
import { companies } from './companies/companies'
import { user } from './users/users'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(customers)
  app.configure(transactions)
  app.configure(companies)
  app.configure(user)
  // All services will be registered here
}
