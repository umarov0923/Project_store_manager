// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  customersDataValidator,
  customersPatchValidator,
  customersQueryValidator,
  customersResolver,
  customersExternalResolver,
  customersDataResolver,
  customersPatchResolver,
  customersQueryResolver
} from './customers.schema'

import type { Application } from '../../declarations'
import { CustomersService, getOptions } from './customers.class'
import { customersPath, customersMethods } from './customers.shared'
import { validateSellerAndSetCompanyId, checkUniqueName, filterByCompanyId} from '../../hooks/customers-hooks';

export * from './customers.class'
export * from './customers.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const customers = (app: Application) => {
  // Register our service on the Feathers application
  app.use(customersPath, new CustomersService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: customersMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(customersPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(customersExternalResolver),
        schemaHooks.resolveResult(customersResolver)
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(customersQueryValidator),
        schemaHooks.resolveQuery(customersQueryResolver),
      ],
      find: [filterByCompanyId],
      get: [],
      create: [
        validateSellerAndSetCompanyId,
        checkUniqueName,
        schemaHooks.validateData(customersDataValidator),
        schemaHooks.resolveData(customersDataResolver)
      ],
      patch: [
        schemaHooks.validateData(customersPatchValidator),
        schemaHooks.resolveData(customersPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [customersPath]: CustomersService
  }
}
