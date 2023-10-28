// Initializes the `v1/user-group-participants` service on path `/v1/user-group-participants`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { UserGroupParticipants } from './user-group-participants.class';
import createModel from './user-group-participants.model';
import hooks from './user-group-participants.hooks';
import MemberCount from './events/MemberCount';
import OnUserGroupParticipantCreatedCreateUpdateMessage from './events/OnUserGroupParticipantCreatedCreateUpdateMessage';
import OnUserGroupParticipantLeftCreateMessage from './events/OnUserGroupParticipantLeftCreateMessage';
import SendSocketEventForParticipant from './events/SendSocketEventForParticipant';
import OnAdminOfGroupLeft from './events/OnAdminOfGroupLeft';
import OnUserGroupParticipantLeftRemoveBroadcastAccess from './events/OnUserGroupParticipantLeftRemoveBroadcastAccess';
import OnUserJoinedOrLeftServer from "./events/OnUserJoinedOrLeftServer";

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/user-group-participants': UserGroupParticipants & ServiceAddons<any>;
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
    app.use('/v1/user-group-participants', new UserGroupParticipants(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/user-group-participants');

    service.hooks(hooks);
    service.on('created', MemberCount);
    service.on('created', OnUserGroupParticipantCreatedCreateUpdateMessage);
    service.on('created', SendSocketEventForParticipant);

    service.on('patched', MemberCount);
    service.on('patched', OnUserGroupParticipantCreatedCreateUpdateMessage);
    service.on('patched', OnUserGroupParticipantLeftCreateMessage);

    service.on('patched', OnUserGroupParticipantLeftRemoveBroadcastAccess);
    service.on('patched', SendSocketEventForParticipant);

    service.on('patched', OnAdminOfGroupLeft);

    service.on('created', OnUserJoinedOrLeftServer);
    service.on('patched', OnUserJoinedOrLeftServer);

    // service.on('removed', MemberCount);
}
