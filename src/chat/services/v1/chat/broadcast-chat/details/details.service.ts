// Initializes the `v1/chat/broadcast-chat/details` service on path `/v1/chat/broadcast-chat/details`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../../declarations';
import { Details } from './details.class';
import hooks from './details.hooks';

// Add this service to the service type index
declare module '../../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/broadcast-chat/details': Details & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/broadcast-chat/details', new Details(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/broadcast-chat/details');

    service.hooks(hooks);
}
