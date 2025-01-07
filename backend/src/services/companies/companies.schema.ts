// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { CompaniesService } from './companies.class'

// Main data model schema
export const companiesSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String({minLength: 1}),
    ownerId: ObjectIdSchema(),
    sellers: Type.Optional(Type.Array(Type.String())),
  },
  { $id: 'Companies', additionalProperties: false }
)
export type Companies = Static<typeof companiesSchema>
export const companiesValidator = getValidator(companiesSchema, dataValidator)
export const companiesResolver = resolve<Companies, HookContext<CompaniesService>>({})

export const companiesExternalResolver = resolve<Companies, HookContext<CompaniesService>>({})

// Schema for creating new entries
export const companiesDataSchema = Type.Pick(companiesSchema, ['name'], {
  $id: 'CompaniesData'
})
export type CompaniesData = Static<typeof companiesDataSchema>
export const companiesDataValidator = getValidator(companiesDataSchema, dataValidator)
export const companiesDataResolver = resolve<Companies, HookContext<CompaniesService>>({})

// Schema for updating existing entries
export const companiesPatchSchema = Type.Partial(companiesSchema, {
  $id: 'CompaniesPatch'
})
export type CompaniesPatch = Static<typeof companiesPatchSchema>
export const companiesPatchValidator = getValidator(companiesPatchSchema, dataValidator)
export const companiesPatchResolver = resolve<Companies, HookContext<CompaniesService>>({})

// Schema for allowed query properties
export const companiesQueryProperties = Type.Pick(companiesSchema, ['_id', 'name', 'ownerId', 'sellers'])
export const companiesQuerySchema = Type.Intersect(
  [
    querySyntax(companiesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CompaniesQuery = Static<typeof companiesQuerySchema>
export const companiesQueryValidator = getValidator(companiesQuerySchema, queryValidator)
export const companiesQueryResolver = resolve<CompaniesQuery, HookContext<CompaniesService>>({})
