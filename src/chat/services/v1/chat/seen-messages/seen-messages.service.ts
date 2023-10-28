// Initializes the `v1/chat/seen-messages` service on path `/v1/chat/seen-messages`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../declarations';
import { SeenMessages } from './seen-messages.class';
import hooks from './seen-messages.hooks';
import OnMessagesSeen from './events/OnMessagesSeen';

// Add this service to the service type index
declare module '../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/seen-messages': SeenMessages & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/seen-messages', new SeenMessages(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/seen-messages');

    service.hooks(hooks);

    service.on('created', OnMessagesSeen);
}
