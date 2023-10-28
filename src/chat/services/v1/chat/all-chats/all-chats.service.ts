// Initializes the `v1/chat/all-chats` service on path `/v1/chat/all-chats`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../declarations';
import { AllChats } from './all-chats.class';
import hooks from './all-chats.hooks';

// Add this service to the service type index
declare module '../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/all-chats': AllChats & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/all-chats', new AllChats(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/all-chats');

    service.hooks(hooks);
}
