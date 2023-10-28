// Initializes the `v1/user-group` service on path `/v1/user-group`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { UserGroup } from './user-group.class';
import createModel from './user-group.model';
import hooks from './user-group.hooks';
import CreateParticipants from './events/CreateParticipants';
import OnUserGroupEditedCreateUpdateMessage from './events/OnUserGroupEditedCreateUpdateMessage';
import OnRemoveDeleteParticipants from './events/OnRemoveDeleteParticipants';
import CreateGeneralChannelOnTeamCreated from './events/CreateGeneralChannelOnTeamCreated';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/user-group': UserGroup & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate'),
    };

    // Initialize our service with any options it requires
    app.use('/v1/user-group', new UserGroup(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/user-group');

    service.hooks(hooks);

    service.on('created', CreateParticipants);
    service.on('created', CreateGeneralChannelOnTeamCreated);

    service.on('patched', OnUserGroupEditedCreateUpdateMessage);
    service.on('removed', OnRemoveDeleteParticipants);
}
