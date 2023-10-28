// Initializes the `v1/chat/broadcast-chat/access` service on path `/v1/chat/broadcast-chat/access`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../../declarations';
import { Access } from './access.class';
import hooks from './access.hooks';

// Add this service to the service type index
declare module '../../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/broadcast-chat/access': Access & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/broadcast-chat/access', new Access(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/broadcast-chat/access');

    service.hooks(hooks);
}
