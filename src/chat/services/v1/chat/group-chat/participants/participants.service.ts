// Initializes the `v1/chat/group-chat/participants` service on path `/v1/chat/group-chat/participants`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../../declarations';
import { Participants } from './participants.class';
import hooks from './participants.hooks';

// Add this service to the service type index
declare module '../../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/group-chat/participants': Participants & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/group-chat/participants', new Participants(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/group-chat/participants');

    service.hooks(hooks);
}
