// Initializes the `../db_services/v1/message-pinned` service on path `/v1/message-pinned`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { MessagePinned } from './message-pinned.class';
import createModel from './message-pinned.model';
import hooks from './message-pinned.hooks';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/message-pinned': MessagePinned & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/message-pinned', new MessagePinned(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/message-pinned');

    service.hooks(hooks);
}
