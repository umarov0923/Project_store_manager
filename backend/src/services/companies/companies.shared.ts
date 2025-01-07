// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Companies,
  CompaniesData,
  CompaniesPatch,
  CompaniesQuery,
  CompaniesService
} from './companies.class'

export type { Companies, CompaniesData, CompaniesPatch, CompaniesQuery }

export type CompaniesClientService = Pick<
  CompaniesService<Params<CompaniesQuery>>,
  (typeof companiesMethods)[number]
>

export const companiesPath = 'companies'

export const companiesMethods: Array<keyof CompaniesService> = ['find', 'get', 'create', 'patch', 'remove']

export const companiesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(companiesPath, connection.service(companiesPath), {
    methods: companiesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [companiesPath]: CompaniesClientService
  }
}
