// Initializes the `v1/user-group-management` service on path `/v1/user-group-management`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { UserGroupManagement } from './user-group-management.class';
import hooks from './user-group-management.hooks';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/user-group-management': UserGroupManagement & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/user-group-management', new UserGroupManagement(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/user-group-management');

    service.hooks(hooks);
}
