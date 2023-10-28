// Initializes the `v1/message` service on path `/v1/message`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { Message } from './message.class';
import createModel from './message.model';
import hooks from './message.hooks';
import OnMessageCreatedCreateMessageRecipients from './events/OnMessageCreatedCreateMessageRecipients';
import OnMessageDeleted from './events/OnMessageDeleted';
import OnMessageEditedUpdateMessageRecipients from './events/OnMessageEditedUpdateMessageRecipients';
import OnBroadcastMessageCreated from './events/OnBroadcastMessageCreated';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/message': Message & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate'),
        whitelist: ['$populate', '$regex', '$options'],
        multi: true,
    };

    // Initialize our service with any options it requires
    app.use('/v1/message', new Message(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/message');

    service.hooks(hooks);

    service.on('created', OnMessageCreatedCreateMessageRecipients);
    service.on('created', OnBroadcastMessageCreated);

    service.on('patched', OnMessageEditedUpdateMessageRecipients);
    // service.on('removed', OnMessageDeleted);
}
