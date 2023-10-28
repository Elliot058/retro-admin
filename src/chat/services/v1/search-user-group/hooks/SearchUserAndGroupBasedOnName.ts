/**
 * Created By Soumya(soumya@smartters.in) on 1/11/2023 at 6:37 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET, UserStatus } from '../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { userpath } from '../../../../service_endpoints/services';
import {
    GroupWithParticipant,
    UserGroupStatus,
    UserGroupType,
} from '../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import { PipelineStage } from 'mongoose';
import { UserGroupParticipantStatus } from '../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';

const SearchUserAndGroupBasedOnName = () => async (context: HookContext) => {
    const { app, params } = context;
    const { user, query } = params;

    if (!user || !query) return context;

    const userData = user as User_GET;
    const userService: Service & ServiceAddons<any> = app.service(userpath);

    const { name } = query;
    let { $skip = '0', $limit = '300' } = query;

    $skip = parseInt($skip);
    $limit = parseInt($limit);

    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $match: {
                status: UserStatus.ACTIVE,
                $or: [
                    {
                        name: {
                            $regex: `.*${name}*.`,
                            $options: 'i',
                        },
                    },
                    {
                        _id: userData._id,
                    },
                ],
            },
        },
        {
            $skip,
        },
        {
            $limit,
        },
        {
            $project: {
                name: 1,
                avatar: 1,
                online: 1,
                _id: 1,
            },
        },
        {
            $group: {
                _id: 1,
                users: {
                    $push: '$$ROOT',
                },
            },
        },
        {
            $lookup: {
                from: 'usergroups',
                pipeline: [
                    {
                        $match: {
                            status: UserGroupStatus.ACTIVE,
                            name: {
                                $regex: `.*${name}*.`,
                                $options: 'i',
                            },
                            type: {
                                $in: [UserGroupType.PRIVATE_GROUP_CHAT, UserGroupType.PUBLIC_GROUP_CHAT],
                            },
                        },
                    },
                    { $skip },
                    { $limit },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            type: 1,
                            avatar: 1,
                            description: 1,
                            memberCount: 1,
                        },
                    },
                    {
                        $lookup: {
                            from: 'usergroupparticipants',
                            let: { groupId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        status: UserGroupParticipantStatus.ACTIVE,
                                        $expr: { $eq: ['$group', '$$groupId'] },
                                        participant: userData._id,
                                    },
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        group: 1,
                                        permissions: 1,
                                    },
                                },
                            ],
                            as: 'participantData',
                        },
                    },
                    {
                        $unwind: { path: '$participantData', preserveNullAndEmptyArrays: true },
                    },
                ],
                as: 'groups',
            },
        },
    );

    const response = await userService.Model.aggregate(aggregateQuery).catch((e) => {
        console.error(e);
        return [];
    });

    // console.log('Response', response);

    const userGroups = [];

    if (response.length) {
        const { users, groups } = response[0];

        if (users && users.length) {
            for (const each of users) {
                const userDataResult = each as User_GET;
                if (userDataResult._id.toString() !== userData._id.toString()) {
                    userGroups.push({
                        type: UserGroupType.PERSONAL_CHAT,
                        avatar: userDataResult.avatar,
                        name: userDataResult.firstName + ' ' + userDataResult.lastName,
                        userId: userDataResult._id,
                        memberCount: null,
                        _id: null,
                        online: userDataResult.online,
                    });
                }
            }
        }
        if (groups && groups.length) {
            for (const each of groups) {
                const groupData = each as GroupWithParticipant;
                userGroups.push({
                    _id: groupData._id,
                    type: groupData.type,
                    avatar: groupData.avatar,
                    name: groupData.name,
                    memberCount: groupData.memberCount,
                    userId: null,
                    online: null,
                    participantData: groupData.participantData ? groupData.participantData : undefined,
                });
            }
        }
    }

    context.result = userGroups;
};

export default SearchUserAndGroupBasedOnName;
