// Initializes the `v1/chat/group-chat/join` service on path `/v1/chat/group-chat/join`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../../declarations';
import { Join } from './join.class';
import hooks from './join.hooks';

// Add this service to the service type index
declare module '../../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/group-chat/join': Join & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/group-chat/join', new Join(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/group-chat/join');

    service.hooks(hooks);
}
