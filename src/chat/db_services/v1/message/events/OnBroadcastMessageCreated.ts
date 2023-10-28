/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 7:32 PM.
 */
import { Message_GET, Message_POST, MessageEntityType, MessageType } from '../interfaces/MessageInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { broadcastAccessPath, messagePath } from '../../../../service_endpoints/services';
import {
    BroadcastAccess_GET,
    BroadcastAccess_QUERY,
    BroadcastAccessStatus,
} from '../../broadcast-access/interfaces/BroadcastAccessInterface';
import { Types } from 'mongoose';

/**
 * On broadcast chat created create message for the respective groups.
 * @param result
 * @param context
 * @constructor
 */
const OnBroadcastMessageCreated = async (result: Message_GET, context: HookContext) => {
    const { app } = context;
    const { entityType, entityId, text, attachment } = result;

    if (entityType !== MessageEntityType.BROADCAST) return context;

    const messageService: Service & ServiceAddons<any> = app.service(messagePath);
    const broadcastAccessService: Service & ServiceAddons<any> = app.service(broadcastAccessPath);

    const broadcastId = entityId?._id ? entityId?._id : entityId;
    const broadcastAccessQuery: BroadcastAccess_QUERY = {
        broadcast: broadcastId as Types.ObjectId,
        status: BroadcastAccessStatus.ACTIVE,
    };
    const groupsUnderBroadcast = await broadcastAccessService
        ._find({
            query: {
                ...broadcastAccessQuery,
                $select: ['group'],
            },
            paginate: false,
        })
        .then((res: Array<BroadcastAccess_GET>) => res.map((e) => e.group));

    const messageData: Array<Message_POST> = groupsUnderBroadcast.map((e) => {
        return {
            entityType: MessageEntityType.USER_GROUP,
            entityId: e,
            attachment,
            text,
            type: MessageType.NORMAL_MESSAGE,
            broadcastMessage: result._id,
            sender: result.sender,
        };
    });
    await messageService.create(messageData, {
        query: {},
        user: context.params.user,
        provider: undefined,
    });
};

export default OnBroadcastMessageCreated;
