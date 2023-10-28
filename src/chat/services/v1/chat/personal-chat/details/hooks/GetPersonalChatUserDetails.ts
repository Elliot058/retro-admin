/**
 * Created By Soumya(soumya@smartters.in) on 1/2/2023 at 1:10 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { userGroupPath } from '../../../../../../service_endpoints/services';
import { PipelineStage, Types } from 'mongoose';
import {
    UserGroupStatus,
    UserGroupType,
} from '../../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import { UserGroupParticipantStatus } from '../../../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';

const GetPersonalChatUserDetails = () => async (context: HookContext) => {
    const { app, params, id } = context;

    const { user } = params;

    if (!user || !id) return context;

    const userData = user as User_GET;

    const groupService: Service & ServiceAddons<any> = app.service(userGroupPath);
    const groupModel = groupService.Model;

    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $match: {
                status: UserGroupStatus.ACTIVE,
                _id: new Types.ObjectId(id),
                type: UserGroupType.PERSONAL_CHAT,
            },
        },
        {
            $project: {
                user: {
                    $cond: {
                        if: {
                            $eq: ['$firstUser', userData._id],
                        },
                        then: '$secondUser',
                        else: '$firstUser',
                    },
                },
                _id: 0,
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        {
            $unwind: { path: '$user' },
        },
        {
            $lookup: {
                from: 'usergroupparticipants',
                let: { userId: '$user._id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$participant', '$$userId'] },
                            status: UserGroupParticipantStatus.ACTIVE,
                        },
                    },
                    {
                        $lookup: {
                            from: 'usergroupparticipants',
                            let: { groupId: '$group' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ['$group', '$$groupId'] },
                                        status: UserGroupParticipantStatus.ACTIVE,
                                        participant: userData._id,
                                    },
                                },
                            ],
                            as: 'participantGroup',
                        },
                    },
                    {
                        $unwind: { path: '$participantGroup' },
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
                        $unwind: '$group',
                    },
                ],
                as: 'commonGroups',
            },
        },
        {
            $project: {
                _id: '$user._id',
                name: {
                    $concat: ['$user.firstName', ' ', '$user.lastName'],
                },
                phone: '$user.phone',
                avatar: '$user.avatar',
                createdAt: '$user.createdAt',
                updatedAt: '$user.updatedAt',
                online: '$user.online',
                bio: '$user.bio',
                commonGroups: {
                    group: {
                        _id: 1,
                        name: 1,
                        avatar: 1,
                        memberCount: 1,
                        type: 1,
                        description: 1,
                    },
                },
            },
        },
    );

    const response = await groupModel.aggregate(aggregateQuery);

    context.result = response[0];
};

export default GetPersonalChatUserDetails;
