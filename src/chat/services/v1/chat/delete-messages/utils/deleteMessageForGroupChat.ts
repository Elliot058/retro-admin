/**
 * Created By Soumya(soumya@smartters.in) on 1/4/2023 at 7:35 PM.
 */
import { Application, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { messagePath } from '../../../../../service_endpoints/services';
import { Message_GET, MessageStatus } from '../../../../../db_services/v1/message/interfaces/MessageInterface';
import {
    MessageRecipient_QUERY,
    MessageRecipientStatus,
} from '../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { deleteMessageRecipients } from './deleteMessageRecipients';

const deleteMessageForGroupChat = async (
    app: Application,
    messages: Array<string> | [],
    user: User_GET,
    group: string,
) => {
    const messageService: Service & ServiceAddons<any> = app.service(messagePath);

    const messagesByUser = await messageService
        ._find({
            query: {
                _id: messages.length
                    ? {
                          $in: messages,
                      }
                    : { $ne: null },
                sender: user._id,
                status: MessageStatus.ACTIVE,
                entityId: group,
                $select: ['_id'],
            },
            paginate: false,
        })
        .then((res: Array<Message_GET>) => res.map((e) => e._id.toString()));

    const messageRecipientQuery1: MessageRecipient_QUERY = {
        status: { $ne: MessageRecipientStatus.DELETED },
        message: {
            $in: messagesByUser,
        },
    };
    await deleteMessageRecipients(messageRecipientQuery1, app);

    if (messages.length) {
        const otherMessages = messages.filter((e) => !messagesByUser.includes(e));
        if (otherMessages.length) {
            const messageRecipientQuery2: MessageRecipient_QUERY = {
                status: { $ne: MessageRecipientStatus.DELETED },
                message: {
                    $in: otherMessages,
                },
            };
            await deleteMessageRecipients(messageRecipientQuery2, app);
        }
    }
};

export default deleteMessageForGroupChat;
