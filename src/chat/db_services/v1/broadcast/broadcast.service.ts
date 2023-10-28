// Initializes the `../db_services/v1/broadcast` service on path `/v1/broadcast`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { Broadcast } from './broadcast.class';
import createModel from './broadcast.model';
import hooks from './broadcast.hooks';
import OnBroadcastCreatedCreateAccess from './events/OnBroadcastCreatedCreateAccess';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/broadcast': Broadcast & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate'),
        whitelist: ['$populate', '$regex', '$options'],
    };

    // Initialize our service with any options it requires
    app.use('/v1/broadcast', new Broadcast(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/broadcast');

    service.hooks(hooks);

    service.on('created', OnBroadcastCreatedCreateAccess);
}
