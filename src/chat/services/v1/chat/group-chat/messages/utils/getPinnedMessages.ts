/**
 * Created By Soumya(soumya@smartters.in) on 2/22/2023 at 5:49 PM.
 */
import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Application, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { messagePinnedPath } from '../../../../../../service_endpoints/services';
import { Types } from 'mongoose';
import {
    MessagePinned_GET,
    MessagePinnedStatus
} from '../../../../../../db_services/v1/message-pinned/interfaces/MessagePinnedInterface';

const getPinnedMessages = async (app: Application, groupId: string, userData: User_GET) => {
    const pinMessageService: Service & ServiceAddons<any> = app.service(messagePinnedPath);
    const response = await pinMessageService.Model.aggregate([
        {
            $match: {
                entityId: new Types.ObjectId(groupId),
                status: MessagePinnedStatus.ACTIVE,
                $or: [
                    {
                        user: userData._id,
                    },
                    {
                        user: null,
                    },
                ],
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $lookup: {
                from: 'messages',
                localField: 'message',
                foreignField: '_id',
                as: 'message',
            },
        },
        {
            $unwind: '$message',
        },
    ]).then((res: Array<MessagePinned_GET>) => res);
    return response;
};

export default getPinnedMessages;
