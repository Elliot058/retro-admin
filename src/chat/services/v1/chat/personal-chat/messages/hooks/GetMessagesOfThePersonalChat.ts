/**
 * Created By Soumya(soumya@smartters.in) on 1/2/2023 at 9:38 AM.
 */
import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { ServiceAddons, HookContext } from '@feathersjs/feathers';
import { messageRecipientsPath } from '../../../../../../service_endpoints/services';
import { PipelineStage } from 'mongoose';
import {
    MessageRecipientEntityType,
    MessageRecipientStatus,
} from '../../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { Types } from 'mongoose';
import getMatchQueryAndSkipLimit from '../../../utils/getMatchQueryAndSkipLimit';
import { MessagePinnedStatus } from '../../../../../../db_services/v1/message-pinned/interfaces/MessagePinnedInterface';
import { MessageStarredStatus } from '../../../../../../db_services/v1/message-starred/interfaces/MessageStarredInterface';
import { MessageReactionStatus } from '../../../../../../db_services/v1/message-reactions/interfaces/MessageReactionInterface';

const GetMessagesOfThePersonalChat = () => async (context: HookContext) => {
    const { params, app } = context;

    const { query, user } = params;

    if (!query || !user) return context;

    const userData = params.user as User_GET;

    const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
    const messageRecipientModel = messageRecipientService.Model;

    const { id, upSkip, downSkip } = query;

    const $skip = parseInt(query.$skip || '0');
    const $limit = parseInt(query.$limit || '100');

    const { $orMatchArray, messageSortValue, limit, skip } = await getMatchQueryAndSkipLimit({
        id: id,
        $skip,
        $limit,
        upSkip,
        downSkip,
        userData,
        groupId: query.group,
        app,
    });

    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $match: {
                status: { $ne: MessageRecipientStatus.DELETED },
                user: userData._id,
                entityId: new Types.ObjectId(query.group),
                entityType: MessageRecipientEntityType.GROUP,
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
        {
            $match: {
                $or: $orMatchArray,
            },
        },
        {
            $sort: { 'message.createdAt': messageSortValue },
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
        {
            $set: {
                message: '$message',
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'message.sender',
                foreignField: '_id',
                as: 'message.sender',
            },
        },
        {
            $unwind: { path: '$message.sender' },
        },
        {
            $lookup: {
                from: 'messages',
                localField: 'message.parentMessage',
                foreignField: '_id',
                as: 'message.parentMessage',
            },
        },
        {
            $unwind: { path: '$message.parentMessage', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'message.parentMessage.sender',
                foreignField: '_id',
                as: 'message.parentMessage.sender',
            },
        },
        {
            $unwind: { path: '$message.parentMessage.sender', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'messagerecipients',
                let: { messageId: '$message.parentMessage._id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$message', '$$messageId'] },
                            user: userData._id,
                            entityId: new Types.ObjectId(query.group),
                        },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            status: '$status',
                            _id: 0,
                        },
                    },
                ],
                as: 'message.parentMessage.status',
            },
        },
        {
            $unwind: { path: '$message.parentMessage.status', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'messagepinneds',
                let: { messageId: '$message._id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$message', '$$messageId'] },
                            entityId: new Types.ObjectId(query.group),
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
                        $limit: 1,
                    },
                    {
                        $project: {
                            _id: 1,
                        },
                    },
                ],
                as: 'message.pinned',
            },
        },
        {
            $unwind: { path: '$message.pinned', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'messagestarreds',
                let: { messageId: '$message._id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$message', '$$messageId'] },
                            entityId: new Types.ObjectId(query.group),
                            status: MessageStarredStatus.ACTIVE,
                            user: userData._id,
                        },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            _id: 1,
                        },
                    },
                ],
                as: 'message.starred',
            },
        },
        {
            $unwind: { path: '$message.starred', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'messagereactions',
                let: { messageId: '$message._id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$message', '$$messageId'] },
                            status: MessageReactionStatus.ACTIVE,
                        },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'reactor',
                            foreignField: '_id',
                            as: 'reactor',
                        },
                    },
                    {
                        $unwind: '$reactor',
                    },
                    {
                        $project: {
                            emoji: 1,
                            reactor: {
                                _id: 1,
                                name: 1,
                                avatar: 1,
                            },
                        },
                    },
                ],
                as: 'message.reactions',
            },
        },
        {
            $project: {
                message: {
                    _id: 1,
                    text: 1,
                    attachment: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    sender: {
                        name: {
                            $concat: ['$message.sender.firstName', ' ', '$message.sender.lastName'],
                        },
                        phone: 1,
                        avatar: 1,
                        _id: 1,
                    },
                    type: 1,
                    status: 1,
                    pinned: '$message.pinned._id',
                    starred: '$message.starred._id',
                    parentMessage: {
                        $cond: {
                            if: { $eq: ['$message.parentMessage', {}] },
                            then: null,
                            else: {
                                _id: '$message.parentMessage._id',
                                text: '$message.parentMessage.text',
                                attachment: '$message.parentMessage.attachment',
                                createdAt: '$message.parentMessage.createdAt',
                                updatedAt: '$message.parentMessage.updatedAt',
                                type: '$message.parentMessage.type',
                                status: '$message.parentMessage.status.status',
                                sender: {
                                    name: {
                                        $concat: [
                                            '$message.parentMessage.sender.firstName',
                                            ' ',
                                            '$message.parentMessage.sender.lastName',
                                        ],
                                    },
                                    phone: '$message.parentMessage.sender.phone',
                                    avatar: '$message.parentMessage.sender.avatar',
                                    _id: '$message.parentMessage.sender._id',
                                },
                            },
                        },
                    },
                },
                _id: 0,
            },
        },
    );

    context.result = {
        messages: await messageRecipientModel.aggregate(aggregateQuery),
    };
};

export default GetMessagesOfThePersonalChat;
