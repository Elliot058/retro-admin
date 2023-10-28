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
 * On all message recipients have deleted the message change the status of the message to seen.
 * @param result
 * @param context
 * @constructor
 */
const OnMessageRecipientDeleted = async (result: MessageRecipient_GET, context: HookContext) => {
    const { app } = context;
    const { status } = context.data as MessageRecipient_PATCH;
    if (status && status === MessageRecipientStatus.DELETED) {
        const { message } = result;
        const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
        const messageRecipientResponse: Array<{ _id: number; totalRecipients: number; deletedRecipients: number }> =
            await messageRecipientService.Model.aggregate([
                {
                    $match: {
                        // status: { $ne: MessageRecipientStatus.DELETED },
                        message: message,
                    },
                },
                {
                    $group: {
                        _id: 1,
                        totalRecipients: { $sum: 1 },
                        deletedRecipients: {
                            $sum: {
                                $cond: { if: { $eq: ['$status', MessageRecipientStatus.DELETED] }, then: 1, else: 0 },
                            },
                        },
                    },
                },
            ]);

        if (messageRecipientResponse.length) {
            const { totalRecipients, deletedRecipients } = messageRecipientResponse[0];
            if (totalRecipients && totalRecipients === deletedRecipients) {
                const messageService: Service & ServiceAddons<any> = app.service(messagePath);
                await messageService.patch(
                    message.toString(),
                    {
                        status: MessageStatus.SEEN,
                    },
                    {
                        query: {
                            $populate: 'sender',
                        },
                    },
                );
            }
        }
    }
};

export default OnMessageRecipientDeleted;
