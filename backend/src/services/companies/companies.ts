// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  companiesDataValidator,
  companiesPatchValidator,
  companiesQueryValidator,
  companiesResolver,
  companiesExternalResolver,
  companiesDataResolver,
  companiesPatchResolver,
  companiesQueryResolver
} from './companies.schema'

import type { Application } from '../../declarations'
import { CompaniesService, getOptions } from './companies.class'
import { companiesPath, companiesMethods } from './companies.shared'
import { limitToOneCompanyPerUser, restrictToOwner, setDefaultRoleBefore , setCompanyIdForUser} from '../../hooks/companies-hooks'

export * from './companies.class'
export * from './companies.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const companies = (app: Application) => {
  // Register our service on the Feathers application
  app.use(companiesPath, new CompaniesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: companiesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(companiesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(companiesExternalResolver),
        schemaHooks.resolveResult(companiesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(companiesQueryValidator),
        schemaHooks.resolveQuery(companiesQueryResolver)
      ],
      find: [],
      get: [restrictToOwner],
      create: [
        schemaHooks.validateData(companiesDataValidator),
        schemaHooks.resolveData(companiesDataResolver),
        limitToOneCompanyPerUser,
        setDefaultRoleBefore

      ],
      patch: [
        schemaHooks.validateData(companiesPatchValidator),
        schemaHooks.resolveData(companiesPatchResolver),
        restrictToOwner,
      ],
      remove: [restrictToOwner],
    },
    after: {
      all: [],
      create: [setCompanyIdForUser]
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [companiesPath]: CompaniesService
  }
}
