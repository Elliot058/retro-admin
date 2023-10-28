/**
 * Created By Soumya(soumya@smartters.in) on 3/16/2023 at 2:38 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { userGroupParticipantsPath } from '../../../../../service_endpoints/services';
import { PipelineStage } from 'mongoose';
import { UserGroupParticipants } from '../../../../../db_services/v1/user-group-participants/user-group-participants.class';
import { UserGroupParticipantStatus } from '../../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import { UserGroupStatus, UserGroupType } from '../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import { GroupTypeQuery } from '../../all-chats/interfaces/GroupTypeQuery';
import { MessageRecipientStatus } from '../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';

const GetAllGroupsForTheUser = () => async (context: HookContext) => {
    const { params, app } = context;
    const { user, query = {} } = params;

    let { $skip = '0', $limit = '300' } = query;
    const { groupTypeQuery } = query;
    const type = parseInt(groupTypeQuery);
    if (type !== GroupTypeQuery.GROUP) return context;

    $skip = parseInt($skip);
    $limit = parseInt($limit);

    if (!user) return context;

    const userData = user as User_GET;

    const userGroupParticipantService: UserGroupParticipants & ServiceAddons<any> =
        app.service(userGroupParticipantsPath);
    const userGroupParticipantModel = userGroupParticipantService.Model;

    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $match: {
                status: UserGroupParticipantStatus.ACTIVE,
                participant: userData._id,
            },
        },
        {
            $lookup: {
                from: 'usergroups',
                localField: 'group',
                foreignField: '_id',
                as: 'group',
            },
        },
        {
            $unwind: { path: '$group' },
        },
        {
            $match: {
                'group.status': UserGroupStatus.ACTIVE,
            },
        },
        {
            $project: {
                group: '$group',
                _id: 0,
            },
        },
    );

    if (groupTypeQuery) {
        aggregateQuery.push({
            $match: {
                'group.isTeam': {
                    $in: [false, undefined],
                },
                'group.parentId': null,
            },
        });
    }

    aggregateQuery.push(
        {
            $lookup: {
                from: 'messagerecipients',
                let: { groupId: '$group._id' },
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
                localField: 'group.firstUser',
                foreignField: '_id',
                as: 'group.firstUser',
            },
        },
        {
            $unwind: { path: '$group.firstUser', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'group.secondUser',
                foreignField: '_id',
                as: 'group.secondUser',
            },
        },
        {
            $unwind: { path: '$group.secondUser', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'usergroups',
                localField: 'group.parentId',
                foreignField: '_id',
                as: 'group.parentId',
            },
        },
        {
            $unwind: { path: '$group.parentId', preserveNullAndEmptyArrays: true },
        },
        {
            $project: {
                unseenCount: '$message.unseenCount',
                lastSeenMessage: 1,
                group: {
                    _id: '$group._id',
                    type: '$group.type',
                    avatar: '$group.avatar',
                    name: '$group.name',
                    userId: undefined,
                    memberCount: '$group.memberCount',
                    isTeam: '$group.isTeam',
                    online: null,
                    parentData: {
                        $cond: {
                            if: { $eq: ['$group.parentId', undefined] },
                            then: undefined,
                            else: {
                                name: '$group.parentId.name',
                                _id: '$group.parentId._id',
                                type: '$group.parentId.type',
                                avatar: '$group.parentId.avatar',
                                memberCount: '$group.parentId.memberCount',
                                isTeam: '$group.isTeam',
                            },
                        },
                    },
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

    context.result = await userGroupParticipantModel.aggregate(aggregateQuery).catch((e) => {
        return e;
    });
};

export default GetAllGroupsForTheUser;
