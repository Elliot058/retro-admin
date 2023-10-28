/**
 * Created By Soumya(soumya@smartters.in) on 1/6/2023 at 4:41 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { messageRecipientsPath } from '../../../../../service_endpoints/services';
import {
    MessageRecipient_QUERY,
    MessageRecipientStatus,
} from '../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { Types } from 'mongoose';

/**
 * On message seen change status to seen of all message recipients.
 * @param result
 * @param context
 * @constructor
 */
const OnMessagesSeen = async (result: any, context: HookContext) => {
    const { params, app, data } = context;

    const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);

    const messageRecipientQuery: MessageRecipient_QUERY = {
        status: MessageRecipientStatus.SENT,
        entityId: data.group as Types.ObjectId,
        user: params.user?._id,
    };

    await messageRecipientService.patch(
        null,
        {
            status: MessageRecipientStatus.SEEN,
        },
        {
            query: messageRecipientQuery,
        },
    );
};

export default OnMessagesSeen;
