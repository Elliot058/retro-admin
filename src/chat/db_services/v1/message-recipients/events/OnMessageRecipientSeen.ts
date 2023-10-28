/**
 * Created By Soumya(soumya@smartters.in) on 1/9/2023 at 2:57 PM.
 */
import {
    MessageRecipient_GET,
    MessageRecipient_PATCH,
    MessageRecipientStatus,
} from '../interfaces/MessageRecipientsInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { messagePath, messageRecipientsPath } from '../../../../service_endpoints/services';
import { MessageStatus } from '../../message/interfaces/MessageInterface';

/**
 * On all message recipients have seen the message change the status of the message to seen.
 * @param result
 * @param context
 * @constructor
 */
const OnMessageRecipientSeen = async (result: MessageRecipient_GET, context: HookContext) => {
    const { app } = context;
    const { status } = context.data as MessageRecipient_PATCH;
    if (status && status === MessageRecipientStatus.SEEN) {
        const { message } = result;
        const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
        const messageRecipientResponse: Array<{ _id: number; totalRecipients: number; seenRecipients: number }> =
            await messageRecipientService.Model.aggregate([
                {
                    $match: {
                        status: { $ne: MessageRecipientStatus.DELETED },
                        message: message,
                    },
                },
                {
                    $group: {
                        _id: 1,
                        totalRecipients: { $sum: 1 },
                        seenRecipients: {
                            $sum: {
                                $cond: { if: { $eq: ['$status', MessageRecipientStatus.SEEN] }, then: 1, else: 0 },
                            },
                        },
                    },
                },
            ]);

        if (messageRecipientResponse.length) {
            const { totalRecipients, seenRecipients } = messageRecipientResponse[0];
            if (totalRecipients && totalRecipients === seenRecipients) {
                const messageService: Service & ServiceAddons<any> = app.service(messagePath);
                await messageService.patch(
                    message.toString(),
                    {
                        status: MessageStatus.SEEN,
                    },
                    {
                        query: {
                            $populate: ['sender', 'entityId'],
                        },
                    },
                );
            }
        }
    }
};

export default OnMessageRecipientSeen;
