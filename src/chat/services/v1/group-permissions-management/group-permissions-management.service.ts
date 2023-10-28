// Initializes the `v1/group-permissions-management` service on path `/v1/group-permissions-management`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { GroupPermissionsManagement } from './group-permissions-management.class';
import hooks from './group-permissions-management.hooks';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/group-permissions-management': GroupPermissionsManagement & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/group-permissions-management', new GroupPermissionsManagement(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/group-permissions-management');

    service.hooks(hooks);
}
