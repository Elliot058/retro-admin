// Initializes the `v1/message-recipients` service on path `/v1/message-recipients`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { MessageRecipients } from './message-recipients.class';
import createModel from './message-recipients.model';
import hooks from './message-recipients.hooks';
import OnMessageRecipientSeen from './events/OnMessageRecipientSeen';
import OnMessageRecipientDeletedDeleteStarredMessage from "./events/OnMessageRecipientDeletedDeleteStarredMessage";

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/message-recipients': MessageRecipients & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate'),
        multi: true,
        whitelist: ['$populate', '$regex', '$options'],
    };

    // Initialize our service with any options it requires
    app.use('/v1/message-recipients', new MessageRecipients(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/message-recipients');

    service.hooks(hooks);

    service.on('patched', OnMessageRecipientSeen);
    service.on('patched', OnMessageRecipientDeletedDeleteStarredMessage);
}
