/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 8:26 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { messagePath } from '../../../../../../service_endpoints/services';
import { PipelineStage, Types } from 'mongoose';
import { MessageEntityType, MessageStatus } from '../../../../../../db_services/v1/message/interfaces/MessageInterface';

/**
 * Find messages on a broadcast.
 * @constructor
 */
const FindBroadcastMessages = () => async (context: HookContext) => {
    const { app, params } = context;
    const { user, query = {} } = params;
    if (!user) return context;

    const userData = user as User_GET;

    let { $skip = '0', $limit = '300' } = query;
    $skip = parseInt($skip);
    $limit = parseInt($limit);

    const { broadcast } = query;

    const messageService: Service & ServiceAddons<any> = app.service(messagePath);
    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $match: {
                status: { $ne: MessageStatus.DELETED },
                entityType: MessageEntityType.BROADCAST,
                entityId: new Types.ObjectId(broadcast),
                sender: userData._id,
            },
        },
        { $skip },
        { $limit },
        {
            $project: {
                _id: 1,
                text: 1,
                attachment: 1,
                createdAt: 1,
                updatedAt: 1,
                type: 1,
                status: 1,
                sender: {
                    name: userData.firstName,
                    phone: userData.phone,
                    avatar: userData.avatar,
                    _id: userData._id,
                },
                parentMessage: null,
            },
        },
    );

    context.result = await messageService.Model.aggregate(aggregateQuery);
};

export default FindBroadcastMessages;
