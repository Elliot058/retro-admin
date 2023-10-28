// Initializes the `../db_services/v1/group-permissions` service on path `/v1/group-permissions`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { GroupPermissions } from './group-permissions.class';
import createModel from './group-permissions.model';
import hooks from './group-permissions.hooks';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/group-permissions': GroupPermissions & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/group-permissions', new GroupPermissions(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/group-permissions');

    service.hooks(hooks);
}
