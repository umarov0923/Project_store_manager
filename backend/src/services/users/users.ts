// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  userDataValidator,
  userPatchValidator,
  userQueryValidator,
  userResolver,
  userExternalResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver
} from './users.schema'

import type { Application, HookContext } from '../../declarations'
import { UserService, getOptions } from './users.class'
import { userPath, userMethods } from './users.shared'
import { handleDatabaseErrors, setDefaultRole, handleSellerRegistration, updateCompanyAfterSellerCreation,  } from '../../hooks/users-hooks'

export * from './users.class'
export * from './users.schema'


const authenticateWithSkip = async (context: HookContext) => {
  try {
    // Попробуем выполнить аутентификацию с использованием токена JWT
    await authenticate('jwt')(context);
  } catch (error) {
    // Если аутентификация не удалась, просто пропустим этот шаг
  }
  return context;
};

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app: Application) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(userPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(userExternalResolver), schemaHooks.resolveResult(userResolver)],
      find: [authenticate('jwt')],
      get: [authenticate('jwt')],
      create: [],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')]
    },
    before: {
      all: [schemaHooks.validateQuery(userQueryValidator), schemaHooks.resolveQuery(userQueryResolver)],
      find: [],
      get: [],
      create: [
        authenticateWithSkip,
        schemaHooks.validateData(userDataValidator),
        schemaHooks.resolveData(userDataResolver),
        setDefaultRole,
        handleSellerRegistration
      ],
      patch: [schemaHooks.validateData(userPatchValidator), schemaHooks.resolveData(userPatchResolver)],
      remove: []
    },
    after: {
      all: [],
      create: [updateCompanyAfterSellerCreation]
    },
    error: {
      all: [handleDatabaseErrors]
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [userPath]: UserService
  }
}
