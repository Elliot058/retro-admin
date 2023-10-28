/**
 * Created By Soumya(soumya@smartters.in) on 1/18/2023 at 8:27 AM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../../db_services/v1/user/interfaces/UserInterfaces';
import {
    Message_Query,
    MessageEntityType,
    MessageStatus,
} from '../../../../../db_services/v1/message/interfaces/MessageInterface';
import { Types } from 'mongoose';
import { Service } from 'feathers-mongoose';
import { messagePath } from '../../../../../service_endpoints/services';

/**
 * Handle message delete operation for broadcast.
 * @constructor
 */
const HandleDeleteOperationForBroadcastMessage = () => async (context: HookContext) => {
    const { data, app, params } = context;
    const { messages, broadcast } = data;

    if (!broadcast) return context;

    const userData = params.user as User_GET;
    if (!userData) return context;

    const messageService: Service & ServiceAddons<any> = app.service(messagePath);
    const broadcastMessageQuery: Message_Query = {
        _id: messages
            ? {
                  $in: messages,
              }
            : { $ne: null },
        sender: userData._id,
        entityType: MessageEntityType.BROADCAST,
        status: { $ne: MessageStatus.DELETED },
        entityId: broadcast as Types.ObjectId,
    };

    data.broadcastMessages = await messageService._patch(
        null,
        {
            status: MessageStatus.DELETED,
        },
        {
            query: {
                ...broadcastMessageQuery,
            },
            paginate: false,
        },
    );

    context.result = {
        message: 'Messages deleted successfully.',
    };
};

export default HandleDeleteOperationForBroadcastMessage;
