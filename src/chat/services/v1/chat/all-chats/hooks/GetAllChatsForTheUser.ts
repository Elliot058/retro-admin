/**
 * Created By Soumya(soumya@smartters.in) on 1/1/2023 at 11:54 AM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { messageRecipientsPath } from '../../../../../service_endpoints/services';
import {
    MessageRecipientEntityType,
    MessageRecipientStatus,
} from '../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { Service } from 'feathers-mongoose';
import { PipelineStage, Types } from 'mongoose';
import { UserGroupStatus, UserGroupType } from '../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import { GroupTypeQuery } from '../interfaces/GroupTypeQuery';
import { BadRequest } from '@feathersjs/errors';

const GetAllChatsForTheUser = () => async (context: HookContext) => {
    const { params, app, id } = context;
    const { user, query = {} } = params;

    let { $skip = '0', $limit = '300' } = query;
    const { groupTypeQuery } = query;

    // If not type group return context.
    if (query.type !== 'group') return context;

    $skip = parseInt($skip);
    $limit = parseInt($limit);

    if (!user) return context;

    const userData = user as User_GET;

    const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
    const messageRecipientModel = messageRecipientService.Model;

    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $sort: {
                _id: -1,
            },
        },
        {
            $match: {
                status: { $ne: MessageRecipientStatus.DELETED },
                user: userData._id,
                entityType: MessageRecipientEntityType.GROUP,
                entityId: id ? new Types.ObjectId(id) : { $ne: null },
            },
        },
        {
            $group: {
                _id: '$entityId',
                unseenCount: {
                    $sum: {
                        $cond: { if: { $eq: ['$status', MessageRecipientStatus.SENT] }, then: 1, else: 0 },
                    },
                },
                message: {
                    $push: '$$ROOT',
                },
            },
        },
        {
            $project: {
                unseenCount: 1,
                lastSeenMessage: {
                    $cond: {
                        if: { $gt: ['$unseenCount', 0] },
                        then: {
                            $arrayElemAt: ['$message', { $subtract: ['$unseenCount', 1] }],
                        },
                        else: undefined,
                    },
                },
                message: { $arrayElemAt: ['$message', 0] },
            },
        },
        // {
        //     $sort: {
        //         'message.message.createdAt': -1,
        //     },
        // },
        {
            $lookup: {
                from: 'usergroups',
                localField: '_id',
                foreignField: '_id',
                as: '_id',
            },
        },
        {
            $unwind: { path: '$_id' },
        },
        {
            $match: {
                '_id.status': UserGroupStatus.ACTIVE,
            },
        },
    );

    if (groupTypeQuery) {
        const type = parseInt(groupTypeQuery);
        if (type === GroupTypeQuery.CHANNEL_GROUP) {
            aggregateQuery.push({
                $match: {
                    '_id.isTeam': true,
                },
            });
        } else if (type === GroupTypeQuery.GROUP) {
            aggregateQuery.push({
                $match: {
                    '_id.isTeam': {
                        $in: [false, undefined],
                    },
                    '_id.parentId': null,
                },
            });
        } else if (type === GroupTypeQuery.PERSONAL) {
            aggregateQuery.push({
                $match: {
                    '_id.type': UserGroupType.PERSONAL_CHAT,
                },
            });
        } else {
            throw new BadRequest('Please provide a valid group type query.');
        }
    }

    aggregateQuery.push(
        { $skip },
        { $limit },
        {
            $lookup: {
                from: 'users',
                localField: '_id.firstUser',
                foreignField: '_id',
                as: '_id.firstUser',
            },
        },
        {
            $unwind: { path: '$_id.firstUser', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id.secondUser',
                foreignField: '_id',
                as: '_id.secondUser',
            },
        },
        {
            $unwind: { path: '$_id.secondUser', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'usergroups',
                localField: '_id.parentId',
                foreignField: '_id',
                as: '_id.parentId',
            },
        },
        {
            $unwind: { path: '$_id.parentId', preserveNullAndEmptyArrays: true },
        },
        {
            $project: {
                message: 1,
                unseenCount: 1,
                lastSeenMessage: 1,
                status: '$message.status',
            },
        },
        // {
        //     $set: {
        //         message: '$message.message',
        //     },
        // },
        {
            $lookup: {
                from: 'messages',
                localField: 'message.message',
                foreignField: '_id',
                as: 'message',
            },
        },
        {
            $unwind: { path: '$message' },
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
            $project: {
                unseenCount: 1,
                lastSeenMessage: {
                    message: 1,
                },
                group: {
                    _id: '$_id._id',
                    type: '$_id.type',
                    avatar: {
                        $cond: {
                            if: { $eq: ['$_id.type', UserGroupType.PERSONAL_CHAT] },
                            then: {
                                $cond: {
                                    if: { $eq: ['$_id.firstUser._id', userData._id] },
                                    then: '$_id.secondUser.avatar' || null,
                                    else: '$_id.firstUser.avatar' || null,
                                },
                            },
                            else: '$_id.avatar',
                        },
                    },
                    name: {
                        $cond: {
                            if: { $eq: ['$_id.type', UserGroupType.PERSONAL_CHAT] },
                            then: {
                                $cond: {
                                    if: { $eq: ['$_id.firstUser._id', userData._id] },
                                    then: {
                                        $concat: ['$_id.secondUser.firstName', ' ', '$_id.secondUser.lastName'],
                                    },
                                    else: {
                                        $concat: ['$_id.firstUser.firstName', ' ', '$_id.firstUser.lastName'],
                                    },
                                },
                            },
                            else: '$_id.name',
                        },
                    },
                    userId: {
                        $cond: {
                            if: { $eq: ['$_id.type', UserGroupType.PERSONAL_CHAT] },
                            then: {
                                $cond: {
                                    if: { $eq: ['$_id.firstUser._id', userData._id] },
                                    then: '$_id.secondUser._id',
                                    else: '$_id.firstUser._id',
                                },
                            },
                            else: undefined,
                        },
                    },
                    memberCount: {
                        $cond: {
                            if: { $eq: ['$_id.type', UserGroupType.PERSONAL_CHAT] },
                            then: undefined,
                            else: '$_id.memberCount',
                        },
                    },
                    isTeam: {
                        $cond: {
                            if: { $eq: ['$_id.type', UserGroupType.PERSONAL_CHAT] },
                            then: undefined,
                            else: '$_id.isTeam',
                        },
                    },
                    online: {
                        $cond: {
                            if: { $eq: ['$_id.type', UserGroupType.PERSONAL_CHAT] },
                            then: {
                                $cond: {
                                    if: { $eq: ['$_id.firstUser._id', userData._id] },
                                    then: '$_id.secondUser.online',
                                    else: '$_id.firstUser.online',
                                },
                            },
                            else: null,
                        },
                    },
                    parentData: {
                        $cond: {
                            if: { $eq: ['$_id.parentId', undefined] },
                            then: undefined,
                            else: {
                                name: '$_id.parentId.name',
                                _id: '$_id.parentId._id',
                                type: '$_id.parentId.type',
                                avatar: '$_id.parentId.avatar',
                                memberCount: '$_id.parentId.memberCount',
                                isTeam: '$_id.parentId.isTeam',
                            },
                        },
                    },
                },
                message: {
                    _id: 1,
                    text: 1,
                    attachment: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    type: 1,
                    status: 1,
                    sender: {
                        name: {
                            $concat: ['$message.sender.firstName', ' ', '$message.sender.lastName'],
                        },
                        phone: 1,
                        avatar: 1,
                        _id: 1,
                    },
                },
                _id: 0,
            },
        },
        {
            $sort: { 'message.createdAt': -1 },
        },
        {
            $lookup: {
                from: 'lives',
                let: { groupId: '$group._id' },
                pipeline: [
                    {
                        $sort: {
                            createdAt: -1,
                        },
                    },
                    {
                        $match: {
                            status: 1,
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            createdBy: 1,
                            group: { $arrayElemAt: ['$groups', 0] },
                        },
                    },
                    {
                        $match: {
                            $expr: { $eq: ['$group', '$$groupId'] },
                        },
                    },
                    { $limit: 1 },
                ],
                as: 'live',
            },
        },
        {
            $unwind: { path: '$live', preserveNullAndEmptyArrays: true },
        },
    );

    const response = await messageRecipientModel.aggregate(aggregateQuery, { allowDiskUse: true });
    context.result = response.map((e) => {
        return {
            ...e,
            group: {
                ...e.group,
                parentData: !Object.keys(e.group.parentData).length ? null : e.group.parentData,
            },
        };
    });
};

export default GetAllChatsForTheUser;
