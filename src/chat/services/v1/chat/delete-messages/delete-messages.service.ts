// Initializes the `v1/chat/personal-chat/delete-messages` service on path `/v1/chat/personal-chat/delete-messages`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../declarations';
import { DeleteMessages } from './delete-messages.class';
import hooks from './delete-messages.hooks';
import OnBroadcastMessageDeleted from './events/OnBroadcastMessageDeleted';

// Add this service to the service type index
declare module '../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/delete-messages': DeleteMessages & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/delete-messages', new DeleteMessages(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/delete-messages');

    service.hooks(hooks);

    service.on('created', OnBroadcastMessageDeleted);
}
