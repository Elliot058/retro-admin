// Initializes the `v1/broadcast-management` service on path `/v1/broadcast-management`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { BroadcastManagement } from './broadcast-management.class';
import hooks from './broadcast-management.hooks';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/broadcast-management': BroadcastManagement & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
        whitelist: ['$populate', '$regex', '$options'],
    };

    // Initialize our service with any options it requires
    app.use('/v1/broadcast-management', new BroadcastManagement(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/broadcast-management');

    service.hooks(hooks);
}
