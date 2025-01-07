// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Companies, CompaniesData, CompaniesPatch, CompaniesQuery } from './companies.schema'

export type { Companies, CompaniesData, CompaniesPatch, CompaniesQuery }

export interface CompaniesParams extends MongoDBAdapterParams<CompaniesQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class CompaniesService<ServiceParams extends Params = CompaniesParams> extends MongoDBService<
  Companies,
  CompaniesData,
  CompaniesParams,
  CompaniesPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('companies'))
  }
}
