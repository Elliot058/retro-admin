// Initializes the `v1/user-group-participants-managements` service on path `/v1/user-group-participants-managements`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { UserGroupParticipantsManagements } from './user-group-participants-management.class';
import hooks from './user-group-participants-management.hooks';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/user-group-participants-management': UserGroupParticipantsManagements & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
        multi: true,
    };

    // Initialize our service with any options it requires
    app.use('/v1/user-group-participants-management', new UserGroupParticipantsManagements(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/user-group-participants-management');

    service.hooks(hooks);
}
