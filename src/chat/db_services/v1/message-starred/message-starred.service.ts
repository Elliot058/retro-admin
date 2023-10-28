// Initializes the `../db_services/v1/message-starred` service on path `/v1/message-starred`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { MessageStarred } from './message-starred.class';
import createModel from './message-starred.model';
import hooks from './message-starred.hooks';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/message-starred': MessageStarred & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/message-starred', new MessageStarred(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/message-starred');

    service.hooks(hooks);
}
