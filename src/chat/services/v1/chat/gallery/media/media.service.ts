// Initializes the `v1/chat/gallery/media` service on path `/v1/chat/gallery/media`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../../declarations';
import { Media } from './media.class';
import hooks from './media.hooks';

// Add this service to the service type index
declare module '../../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/gallery/media': Media & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/gallery/media', new Media(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/gallery/media');

    service.hooks(hooks);
}
