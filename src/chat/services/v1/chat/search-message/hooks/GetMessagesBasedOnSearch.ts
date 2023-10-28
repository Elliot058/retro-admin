/**
 * Created By Soumya(soumya@smartters.in) on 2/22/2023 at 2:34 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { messageRecipientsPath } from '../../../../../service_endpoints/services';
import { PipelineStage, Types } from 'mongoose';
import {
    MessageRecipientEntityType,
    MessageRecipientStatus,
} from '../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { UserGroupType } from '../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';

const GetMessagesBasedOnSearch = () => async (context: HookContext) => {
    const { app, params } = context;
    const { query, user } = params;
    if (!query || !user) return context;

    const userData = user as User_GET;
    const { search, group: groupId } = query;

    const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
    const messageRecipientModel = messageRecipientService.Model;

    const $skip = parseInt(query.$skip || '0');
    const $limit = parseInt(query.$limit || '100');

    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $match: {
                status: { $ne: MessageRecipientStatus.DELETED },
                user: userData._id,
                entityId: groupId ? new Types.ObjectId(query.group) : { $ne: null },
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
            $sort: { 'message.createdAt': -1 },
        },
        {
            $match: {
                'message.text': {
                    $regex: RegExp(search, 'i'),
                    // $options: 'i',
                },
            },
        },
        { $skip },
        { $limit },
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
                from: 'usergroups',
                localField: 'message.entityId',
                foreignField: '_id',
                as: 'message.entityId',
            },
        },
        {
            $unwind: { path: '$message.entityId', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'message.entityId.firstUser',
                foreignField: '_id',
                as: 'message.entityId.firstUser',
            },
        },
        {
            $unwind: { path: '$message.entityId.firstUser', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'message.entityId.secondUser',
                foreignField: '_id',
                as: 'message.entityId.secondUser',
            },
        },
        {
            $unwind: { path: '$message.entityId.secondUser', preserveNullAndEmptyArrays: true },
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
            $project: {
                message: {
                    _id: 1,
                    text: 1,
                    attachment: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    entityId: {
                        _id: 1,
                        type: 1,
                        avatar: {
                            $cond: {
                                if: { $eq: ['$message.entityId.type', UserGroupType.PERSONAL_CHAT] },
                                then: {
                                    $cond: {
                                        if: { $eq: ['$message.entityId.secondUser._id', userData._id] },
                                        then: '$message.entityId.firstUser.avatar' || null,
                                        else: '$message.entityId.secondUserUser.avatar' || null,
                                    },
                                },
                                else: '$message.entityId.avatar',
                            },
                        },
                        name: {
                            $cond: {
                                if: { $eq: ['$message.entityId.type', UserGroupType.PERSONAL_CHAT] },
                                then: {
                                    $cond: {
                                        if: { $eq: ['$message.entityId.firstUser._id', userData._id] },
                                        then: '$message.entityId.secondUser.name',
                                        else: '$message.entityId.firstUser.name',
                                    },
                                },
                                else: '$message.entityId.name',
                            },
                        },
                        userId: {
                            $cond: {
                                if: { $eq: ['$message.entityId.type', UserGroupType.PERSONAL_CHAT] },
                                then: {
                                    $cond: {
                                        if: { $eq: ['$message.entityId.firstUser._id', userData._id] },
                                        then: '$message.entityId.secondUser._id',
                                        else: '$message.entityId.firstUser._id',
                                    },
                                },
                                else: undefined,
                            },
                        },
                        memberCount: {
                            $cond: {
                                if: { $eq: ['$message.entityId.type', UserGroupType.PERSONAL_CHAT] },
                                then: undefined,
                                else: '$message.entityId.memberCount',
                            },
                        },
                        online: {
                            $cond: {
                                if: { $eq: ['$message.entityId.type', UserGroupType.PERSONAL_CHAT] },
                                then: {
                                    $cond: {
                                        if: { $eq: ['$message.entityId.firstUser._id', userData._id] },
                                        then: '$message.entityId.secondUser.online',
                                        else: '$message.entityId.firstUser.online',
                                    },
                                },
                                else: null,
                            },
                        },
                    },
                    type: 1,
                    status: 1,
                    sender: {
                        name: '$message.sender.name',
                        phone: 1,
                        avatar: 1,
                        _id: 1,
                    },
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
                                sender: {
                                    name: '$message.parentMessage.sender.name',
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

    context.result = await messageRecipientModel.aggregate(aggregateQuery, { allowDiskUse: true });
};

export default GetMessagesBasedOnSearch;
