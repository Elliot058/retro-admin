// Initializes the `../db_services/v1/broadcast-access` service on path `/v1/broadcast-access`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { BroadcastAccess } from './broadcast-access.class';
import createModel from './broadcast-access.model';
import hooks from './broadcast-access.hooks';
import OnBroadcastAccessUpdated from './events/OnBroadcastAccessUpdated';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/broadcast-access': BroadcastAccess & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate'),
        multi: true,
        whitelist: ['$populate', '$regex', '$options'],
    };

    // Initialize our service with any options it requires
    app.use('/v1/broadcast-access', new BroadcastAccess(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/broadcast-access');

    service.hooks(hooks);

    service.on('created', OnBroadcastAccessUpdated);
    service.on('patched', OnBroadcastAccessUpdated);
    service.on('removed', OnBroadcastAccessUpdated);
}
