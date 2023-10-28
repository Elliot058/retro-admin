/**
 * Created By Soumya(soumya@smartters.in) on 1/4/2023 at 9:03 PM.
 */
import {
    MessageRecipient_GET,
    MessageRecipient_QUERY,
    MessageRecipientStatus,
} from '../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { BadRequest } from '@feathersjs/errors';
import { Service } from 'feathers-mongoose';
import { Application, ServiceAddons } from '@feathersjs/feathers';
import { messageRecipientsPath } from '../../../../../service_endpoints/services';

export const deleteMessageRecipients = async (messageRecipientQuery: MessageRecipient_QUERY, app: Application) => {
    const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
    if (!messageRecipientQuery.message) {
        await messageRecipientService._patch(
            null,
            {
                status: MessageRecipientStatus.DELETED,
            },
            {
                query: {
                    ...messageRecipientQuery,
                },
            },
        );
        return;
    }
    await messageRecipientService
        .patch(
            null,
            {
                status: MessageRecipientStatus.DELETED,
            },
            {
                query: {
                    ...messageRecipientQuery,
                    $populate: [
                        {
                            path: 'message',
                            populate: [
                                {
                                    path: 'sender',
                                },
                                {
                                    path: 'parentMessage',
                                    populate: [
                                        {
                                            path: 'sender',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            path: 'entityId',
                            populate: [
                                {
                                    path: 'firstUser',
                                },
                                {
                                    path: 'secondUser',
                                },
                            ],
                        },
                    ],
                },
                paginate: false,
            },
        )
        .then((res: Array<MessageRecipient_GET>) => {
            // console.log(res);
            return res;
        })
        .catch(() => {
            throw new BadRequest('Can not delete this message.');
        });
};
