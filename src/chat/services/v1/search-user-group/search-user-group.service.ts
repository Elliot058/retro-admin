// Initializes the `v1/search-user-group` service on path `/v1/search-user-group`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { SearchUserGroup } from './search-user-group.class';
import hooks from './search-user-group.hooks';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/search-user-group': SearchUserGroup & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/search-user-group', new SearchUserGroup(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/search-user-group');

    service.hooks(hooks);
}
