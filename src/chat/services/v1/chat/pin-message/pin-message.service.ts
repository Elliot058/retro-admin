// Initializes the `v1/pin-message` service on path `/v1/pin-message`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../declarations';
import { PinMessage } from './pin-message.class';
import hooks from './pin-message.hooks';

// Add this service to the service type index
declare module '../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/pin-message': PinMessage & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/chat/pin-message', new PinMessage(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/pin-message');

    service.hooks(hooks);
}
