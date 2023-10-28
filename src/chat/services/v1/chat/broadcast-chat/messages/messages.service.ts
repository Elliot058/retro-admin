// Initializes the `v1/chat/broadcast-chat/messages` service on path `/v1/chat/broadcast-chat/messages`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../../declarations';
import { Messages } from './messages.class';
import hooks from './messages.hooks';

// Add this service to the service type index
declare module '../../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/broadcast-chat/messages': Messages & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
        whitelist: ['$populate', '$regex', '$options'],
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/broadcast-chat/messages', new Messages(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/broadcast-chat/messages');

    service.hooks(hooks);
}
