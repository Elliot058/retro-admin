/**
 * Created By Soumya(soumya@smartters.in) on 2/22/2023 at 5:15 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { MessageRecipient_GET, MessageRecipientStatus } from '../interfaces/MessageRecipientsInterface';
import { MessageStarred } from '../../message-starred/message-starred.class';
import { messageStarredPath } from '../../../../service_endpoints/services';
import { MessageStarred_FIND, MessageStarredStatus } from '../../message-starred/interfaces/MessageStarredInterface';

const OnMessageRecipientDeletedDeleteStarredMessage = async (result: MessageRecipient_GET, context: HookContext) => {
    const { app, data } = context;

    if (data.status && data.status === MessageRecipientStatus.DELETED) {
        const { message, user } = result;

        const starredMessageService: MessageStarred & ServiceAddons<any> = app.service(messageStarredPath);
        const starredMessageData = await starredMessageService
            ._find({
                query: {
                    user,
                    message,
                    status: MessageStarredStatus.ACTIVE,
                    $limit: 1,
                },
            })
            .then((res: MessageStarred_FIND) => (res.total ? res.data[0] : null));
        if (starredMessageData) {
            await starredMessageService._patch(starredMessageData._id.toString(), {
                status: MessageStarredStatus.DELETED,
            });
        }
    }
};

export default OnMessageRecipientDeletedDeleteStarredMessage;
