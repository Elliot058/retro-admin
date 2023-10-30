// Initializes the `data-tables` service on path `/data-tables`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { DataTables } from './data-tables.class';
import createModel from '../../models/data-tables.model';
import hooks from './data-tables.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'data-tables': DataTables & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/data-tables', new DataTables(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('data-tables');

  service.hooks(hooks);
}
