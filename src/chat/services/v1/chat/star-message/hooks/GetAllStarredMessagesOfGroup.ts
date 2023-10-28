/**
 * Created By Soumya(soumya@smartters.in) on 2/23/2023 at 2:56 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { messageStarredPath } from '../../../../../service_endpoints/services';
import { Types } from 'mongoose';
import {
    MessageStarred_GET,
    MessageStarredStatus,
} from '../../../../../db_services/v1/message-starred/interfaces/MessageStarredInterface';
import { MessageReactionStatus } from '../../../../../db_services/v1/message-reactions/interfaces/MessageReactionInterface';

const GetAllStarredMessagesOfGroup = () => async (context: HookContext) => {
    const { app, params } = context;
    const { user, query } = params;
    if (!user || !query) return context;
    const userData = user as User_GET;

    const $skip = parseInt(query.$skip || '0');
    const $limit = parseInt(query.$limit || '100');

    const starMessageService: Service & ServiceAddons<any> = app.service(messageStarredPath);
    context.result = await starMessageService.Model.aggregate([
        {
            $match: {
                entityId: new Types.ObjectId(query.group),
                status: MessageStarredStatus.ACTIVE,
                user: userData._id,
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        { $skip },
        { $limit },
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
        {
            $lookup: {
                from: 'messagerecepients',
                let: { messageId: '$message._id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$message', '$$messageId'] },
                            status: { $ne: MessageReactionStatus.DELETED },
                            user: userData._id,
                            entityId: new Types.ObjectId(query.group),
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                        },
                    },
                ],
                as: 'message.recipient',
            },
        },
        {
            $unwind: { path: '$message.recipient' },
        },
        {
            $project: {
                _id: 1,
                status: 1,
                createdAt: 1,
                message: {
                    _id: 1,
                    text: 1,
                    attachment: 1,
                    type: 1,
                    status: 1,
                    createdAt: 1,
                },
            },
        },
    ]).then((res: Array<MessageStarred_GET>) => res);
};

export default GetAllStarredMessagesOfGroup;
