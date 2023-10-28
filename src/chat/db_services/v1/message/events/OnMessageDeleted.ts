/**
 * Created By Soumya(soumya@smartters.in) on 12/30/2022 at 6:58 PM.
 */
import { Message_GET } from '../interfaces/MessageInterface';
import { HookContext } from '@feathersjs/feathers';
import { messageRecipientsPath } from '../../../../service_endpoints/services';
import {
    MessageRecipient_PATCH,
    MessageRecipient_QUERY,
    MessageRecipientStatus,
} from '../../message-recipients/interfaces/MessageRecipientsInterface';

/**
 * On message deleted delete the message for all the recipients.
 * @param result
 * @param context
 * @constructor
 */
const OnMessageDeleted = async (result: Message_GET, context: HookContext) => {
    const { app } = context;

    // Data to be updated on message recipient object.
    const messageRecipientUpdatedData: MessageRecipient_PATCH = {
        status: MessageRecipientStatus.DELETED,
    };

    // Query based on which message recipients will be searched.
    const messageRecipientQuery: MessageRecipient_QUERY = {
        message: result._id,
        status: { $ne: MessageRecipientStatus.DELETED },
    };

    // Update the status of the message recipient objects.
    await app.service(messageRecipientsPath)._patch(null, messageRecipientUpdatedData, {
        query: messageRecipientQuery,
    });
};

export default OnMessageDeleted;
