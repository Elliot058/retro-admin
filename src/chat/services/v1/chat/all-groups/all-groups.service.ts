// Initializes the `v1/chat/all-groups` service on path `/v1/chat/all-groups`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../declarations';
import { AllGroups } from './all-groups.class';
import hooks from './all-groups.hooks';

// Add this service to the service type index
declare module '../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/all-groups': AllGroups & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/all-groups', new AllGroups(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/all-groups');

    service.hooks(hooks);
}
