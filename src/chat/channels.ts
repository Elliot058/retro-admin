import '@feathersjs/transport-commons';
import { Application } from './declarations';
import { User_GET } from './db_services/v1/user/interfaces/UserInterfaces';
import {
    groupJoinPath,
    messagePath,
    messageRecipientsPath,
    personalChatDetailsCustomPath,
    userGroupParticipantsPath,
} from './service_endpoints/services';
import MessageRecipientPublishEvent from './socket_helper/MessageRecipientPublishEvent';
import { RealTimeConnection } from '@feathersjs/transport-commons/lib/channels/channel/base';
import { Params } from '@feathersjs/feathers';
import UpdateOnlineStatus, { SocketActions } from './socket_helper/UpdateOnlineStatus';
import MessageSeenPublishEvent from './socket_helper/MessageSeenPublishEvent';
import LastSeenPublishEvent from './socket_helper/LastSeenPublishEvent';
import ParticipantUpdatedEvent from './socket_helper/ParticipantUpdatedEvent';

export default function (app: Application): void {
    if (typeof app.channel !== 'function') {
        // If no real-time functionality has been configured just return
        return;
    }

    app.on('connection', (connection: RealTimeConnection): void => {
        // On a new real-time connection, add it to the anonymous channel
        app.channel('anonymous').join(connection);
    });

    app.on('login', async (authResult: any, params: Params): Promise<void> => {
        // connection can be undefined if there is no
        // real-time connection, e.g. when logging in via REST
        if (params) {
            const { connection } = params;
            if (connection) {
                // Obtain the logged in user from the connection
                // const user = connection.user;

                // The connection is no longer anonymous, remove it
                app.channel('anonymous').leave(connection);

                // Add it to the authenticated user channel
                app.channel('authenticated').join(connection);

                const userData = connection.user as User_GET;
                // console.log(userData);
                await UpdateOnlineStatus(userData, app, SocketActions.LOGIN);

                app.channel(`userIds/${userData._id}`).join(connection);
            }
        }
    });

    app.on('disconnect', async (connection: RealTimeConnection): Promise<void> => {
        if (connection) {
            app.channel('authenticated').leave(connection);
            app.channel('anonymous').join(connection);

            const userData = connection.user as User_GET;
            if (userData) {
                await UpdateOnlineStatus(connection.user as User_GET, app, SocketActions.DISCONNECT);
                app.channel(`userIds/${userData._id}`).leave(connection);
            }
        }
    });

    app.service(messageRecipientsPath).publish('created', (result, context) => {
        return MessageRecipientPublishEvent(result, context);
    });

    app.service(messageRecipientsPath).publish('patched', (result, context) => {
        return MessageRecipientPublishEvent(result, context);
    });

    app.service(messageRecipientsPath).publish('removed', (result, context) => {
        return MessageRecipientPublishEvent(result, context);
    });

    app.service(messagePath).publish('patched', (result, context) => {
        return MessageSeenPublishEvent(result, context);
    });

    app.service(personalChatDetailsCustomPath).publish('updated', (result, context) => {
        return LastSeenPublishEvent(result, context);
    });

    app.service(groupJoinPath).publish('updated', (result, context) => {
        return ParticipantUpdatedEvent(result, context);
    });

    // app.service(userGroupParticipantsPath).publish('created', (result, context) => {
    //     return ParticipantUpdatedEvent(result, context);
    // });
    // app.service(userGroupParticipantsPath).publish('patched', (result, context) => {
    //     return ParticipantUpdatedEvent(result, context);
    // });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // app.publish((data: any, hook: HookContext) => {
    //     // Here you can add event publishers to channels set up in `channels.ts`
    //     // To publish only for a specific event use `app.publish(eventname, () => {})`
    //
    //     // console.log('Publishing all events to all authenticated users. See `channels.ts` and https://docs.feathersjs.com/api/channels.html for more information.'); // eslint-disable-line
    //
    //     // e.g. to publish all service events to all authenticated users use
    //     return app.channel('authenticated');
    // });

    // Here you can also add service specific event publishers
    // e.g. the publish the `users` service `created` event to the `admins` channel
    // app.service('users').publish('created', () => app.channel('admins'));

    // With the userid and email organization from above you can easily select involved users
    // app.service('messages').publish(() => {
    //   return [
    //     app.channel(`userIds/${data.createdBy}`),
    //     app.channel(`emails/${data.recipientEmail}`)
    //   ];
    // });
}
