/**
 * Created By Soumya(soumya@smartters.in) on 1/10/2023 at 3:46 PM.
 */
import { HookContext } from '@feathersjs/feathers';
import { LastSeenPublishResponse } from '../services/v1/chat/personal-chat/details/interfaces/LastSeenPublishResponse';

/**
 * Last seen publish event.
 * @param result
 * @param context
 * @constructor
 */
const LastSeenPublishEvent = (result: LastSeenPublishResponse, context: HookContext) => {
    const { app } = context;
    const { user } = result;

    return [app.channel(`userIds/${user.toString()}`)];
};

export default LastSeenPublishEvent;
