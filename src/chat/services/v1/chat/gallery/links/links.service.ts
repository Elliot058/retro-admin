// Initializes the `v1/chat/gallery/links` service on path `/v1/chat/gallery/links`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../../declarations';
import { Links } from './links.class';
import hooks from './links.hooks';

// Add this service to the service type index
declare module '../../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/gallery/links': Links & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/gallery/links', new Links(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/gallery/links');

    service.hooks(hooks);
}
