// Initializes the `v1/chat/search-message` service on path `/v1/chat/search-message`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../declarations';
import { SearchMessage } from './search-message.class';
import hooks from './search-message.hooks';

// Add this service to the service type index
declare module '../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/search-message': SearchMessage & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/search-message', new SearchMessage(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/search-message');

    service.hooks(hooks);
}
