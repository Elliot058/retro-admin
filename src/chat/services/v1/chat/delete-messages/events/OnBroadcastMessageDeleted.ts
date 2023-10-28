/**
 * Created By Soumya(soumya@smartters.in) on 1/18/2023 at 8:51 AM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Message_GET, MessageDeleteType } from '../../../../../db_services/v1/message/interfaces/MessageInterface';
import {
    MessageRecipient_GET,
    MessageRecipient_QUERY,
    MessageRecipientStatus,
} from '../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { User_GET } from '../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { messageRecipientsPath } from '../../../../../service_endpoints/services';

/**
 * On broad cast message deleted delete all recipients according to given delete type.
 * @param result
 * @param context
 * @constructor
 */
const OnBroadcastMessageDeleted = async (result: any, context: HookContext) => {
    const { app, data, params } = context;
    const { broadcast, deleteType } = data;
    if (!broadcast) return context;

    const userData = params.user as User_GET;
    if (!userData) return context;

    const broadcastMessages = data.broadcastMessages as Array<Message_GET>;
    if (broadcastMessages && broadcastMessages.length) {
        const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
        const messageRecipientQuery: MessageRecipient_QUERY = {
            message: {
                $in: broadcastMessages.map((e) => e._id),
            },
            status: { $ne: MessageRecipientStatus.DELETED },
            user: deleteType === MessageDeleteType.FOR_ME ? userData._id : { $ne: null },
        };

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
            .catch((e) => {
                console.error('Message Recipient Delete Error.........', e);
                // throw new BadRequest('Can not delete this message.');
            });
    }
};

export default OnBroadcastMessageDeleted;
