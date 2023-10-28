/**
 * Created By Soumya(soumya@smartters.in) on 3/16/2023 at 2:38 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { userGroupPath } from '../../../../../service_endpoints/services';
import { PipelineStage } from 'mongoose';
import { UserGroupStatus, UserGroupType } from '../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import { GroupTypeQuery } from '../../all-chats/interfaces/GroupTypeQuery';
import { MessageRecipientStatus } from '../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { UserGroup } from '../../../../../db_services/v1/user-group/user-group.class';

const GetAllPersonalChatsForTheUser = () => async (context: HookContext) => {
    const { params, app } = context;
    const { user, query = {} } = params;

    let { $skip = '0', $limit = '300' } = query;
    const { groupTypeQuery } = query;
    const type = parseInt(groupTypeQuery);
    if (type !== GroupTypeQuery.PERSONAL) return context;

    $skip = parseInt($skip);
    $limit = parseInt($limit);

    if (!user) return context;

    const userData = user as User_GET;

    const userGroupService: UserGroup & ServiceAddons<any> = app.service(userGroupPath);
    const userGroupModel = userGroupService.Model;

    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $match: {
                status: UserGroupStatus.ACTIVE,
                $or: [
                    {
                        firstUser: userData._id,
                    },
                    {
                        secondUser: userData._id,
                    },
                ],
                type: UserGroupType.PERSONAL_CHAT,
            },
        },
        {
            $lookup: {
                from: 'messagerecipients',
                let: { groupId: '$_id' },
                pipeline: [
                    {
                        $sort: {
                            _id: -1,
                        },
                    },
                    {
                        $match: {
                            $expr: { $eq: ['$entityId', '$$groupId'] },
                            status: { $ne: MessageRecipientStatus.DELETED },
                            user: userData._id,
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
                ],
                as: 'message',
            },
        },
        {
            $unwind: { path: '$message', preserveNullAndEmptyArrays: true },
        },
        {
            $sort: {
                'message.message.createdAt': -1,
            },
        },
        { $skip },
        { $limit },
        {
            $lookup: {
                from: 'users',
                localField: 'firstUser',
                foreignField: '_id',
                as: 'firstUser',
            },
        },
        {
            $unwind: { path: '$firstUser', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'secondUser',
                foreignField: '_id',
                as: 'secondUser',
            },
        },
        {
            $unwind: { path: '$secondUser', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'usergroups',
                localField: 'parentId',
                foreignField: '_id',
                as: 'parentId',
            },
        },
        {
            $unwind: { path: '$parentId', preserveNullAndEmptyArrays: true },
        },
        {
            $project: {
                unseenCount: '$message.unseenCount',
                lastSeenMessage: 1,
                group: {
                    _id: 1,
                    type: 1,
                    avatar: {
                        $cond: {
                            if: { $eq: ['$firstUser._id', userData._id] },
                            then: '$secondUser.avatar' || null,
                            else: '$firstUser.avatar' || null,
                        },
                    },
                    name: {
                        $cond: {
                            if: { $eq: ['$firstUser._id', userData._id] },
                            then: '$secondUser.name',
                            else: '$firstUser.name',
                        },
                    },
                    userId: {
                        $cond: {
                            if: { $eq: ['$firstUser._id', userData._id] },
                            then: '$secondUser._id',
                            else: '$firstUser._id',
                        },
                    },
                    memberCount: undefined,
                    isTeam: undefined,
                    online: {
                        $cond: {
                            if: { $eq: ['$firstUser._id', userData._id] },
                            then: '$secondUser.online',
                            else: '$firstUser.online',
                        },
                    },
                    parentData: null,
                },
                message: {
                    _id: '$message.message._id',
                    text: '$message.message.text',
                    attachment: '$message.message.attachment',
                    createdAt: '$message.message.createdAt',
                    updatedAt: '$message.message.updatedAt',
                    type: '$message.message.type',
                    status: '$message.message.status',
                    sender: {
                        name: '$message.message.sender.name',
                        phone: '$message.message.sender.phone',
                        avatar: '$message.message.sender.avatar',
                        _id: '$message.message.sender._id',
                    },
                },
            },
        },
    );

    context.result = await userGroupModel.aggregate(aggregateQuery).catch((e) => {
        return e;
    });
};

export default GetAllPersonalChatsForTheUser;
