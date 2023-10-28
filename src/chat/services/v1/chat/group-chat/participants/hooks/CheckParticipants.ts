/**
 * Created By Abhilash(abhilash@smartters.in) on 27-12-2022 at 13:07
 */

import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import {
    UserGroupParticipant_FIND,
    UserGroupParticipant_GET,
    UserGroupParticipant_POST,
    UserGroupParticipant_QUERY,
    UserGroupParticipantStatus,
} from '../../../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import { BadRequest } from '@feathersjs/errors';
import { Types } from 'mongoose';
import { Service } from 'feathers-mongoose';
import { userGroupParticipantsPath } from '../../../../../../service_endpoints/services';
import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import {
    GroupPermission_GET,
    GroupPermissionStatus,
    GroupPermissionType,
} from '../../../../../../db_services/v1/group-permissions/interfaces/GroupPermissionInterface';
import getAllGroupPermissions from '../../../../../../db_services/v1/group-permissions/utils/getAllGroupPermissions';
import { UserGroupType } from '../../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';

/**
 * Check the participants to be added in to the group.
 * @constructor
 */
const CheckParticipants = () => async (context: HookContext) => {
    const { app, data, params } = context;

    const { groupData, participants, createdBy, isUserAdmin } = data as UserGroupParticipant_POST;

    if (!participants || !groupData) return context;

    const previousParticipants: Array<Types.ObjectId> = [];
    const newParticipants: Array<UserGroupParticipant_POST> = [];

    const userParticipantService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);

    const { participants: allParticipantsOfGroup = [] } = params;
    const statusForParticipant =
        groupData.type === UserGroupType.PRIVATE_GROUP_CHAT
            ? isUserAdmin
                ? UserGroupParticipantStatus.ACTIVE
                : UserGroupParticipantStatus.REQUESTED
            : UserGroupParticipantStatus.ACTIVE;

    // Check if the participants are previously exist in the group.
    for (const each of participants) {
        const query: UserGroupParticipant_QUERY = {
            participant: each,
            group: groupData?._id,
        };
        const userParticipantExists = await userParticipantService
            ._find({
                query: {
                    ...query,
                    $limit: 1,
                },
            })
            .then((res: UserGroupParticipant_FIND) => (res.total ? res.data[0] : null));
        if (!userParticipantExists) {
            newParticipants.push({
                createdBy,
                group: groupData._id,
                participant: each,
                status: statusForParticipant,
            });
            allParticipantsOfGroup.push(each.toString());
        } else {
            if (userParticipantExists.status === UserGroupParticipantStatus.LEFT) {
                previousParticipants.push(userParticipantExists._id);
                allParticipantsOfGroup.push(each.toString());
            } else {
                throw new BadRequest(
                    userParticipantExists.status === UserGroupParticipantStatus.ACTIVE
                        ? 'You are already a member of this group'
                        : 'You have already requested to join this group.',
                );
            }
        }
    }

    if (!newParticipants.length && !previousParticipants.length) {
        throw new BadRequest('Please check the participants you are adding to the group.');
    }

    context.result = {};

    let allParticipants: Array<UserGroupParticipant_GET> = [];
    const query = {
        isAssignable: true,
        status: GroupPermissionStatus.ACTIVE,
        $select: ['_id'],
        type: groupData.parentId ? GroupPermissionType.CHANNEL : GroupPermissionType.GROUP,
    };
    const permissionsData = await getAllGroupPermissions(app, query);

    // if new participants are there then add them.
    if (newParticipants.length) {
        // console.log('New Participant', allParticipantsOfGroup);
        allParticipants = await userParticipantService.create(
            newParticipants.map((e) => {
                return {
                    ...e,
                    permissions: permissionsData,
                };
            }),
            {
                ...params,
                query: {
                    $limit: newParticipants.length,
                    $populate: [
                        {
                            path: 'participant',
                            select: ['name'],
                        },
                        {
                            path: 'group',
                            populate: ['parentId'],
                        },
                        {
                            path: 'permissions',
                        },
                    ],
                },
                provider: 'server',
                participants: allParticipantsOfGroup,
            },
        );
    }

    // if previously left participants are there then update their status.
    if (previousParticipants.length) {
        const groupParticipants: Array<UserGroupParticipant_GET> = await userParticipantService.patch(
            null,
            {
                status: statusForParticipant,
                permissions: permissionsData,
            },
            {
                ...params,
                query: {
                    _id: {
                        $in: previousParticipants,
                    },
                    status: UserGroupParticipantStatus.LEFT,
                    $limit: previousParticipants.length,
                    $populate: [
                        {
                            path: 'participant',
                            select: ['name'],
                        },
                        {
                            path: 'group',
                            populate: ['parentId'],
                        },
                        {
                            path: 'permissions',
                        },
                    ],
                },
                provider: 'server',
                participants: allParticipantsOfGroup,
            },
        );
        allParticipants = allParticipants.concat(groupParticipants);
    }

    context.result = allParticipants.map((e) => {
        const { participant, permissions, _id, status } = e;
        const participantData = participant as User_GET;
        return {
            _id,
            status,
            participant: {
                _id: participantData._id,
                name: participantData.firstName,
                avatar: participantData.avatar,
            },
            permissions: permissions.map((e) => {
                const permissionData = e as GroupPermission_GET;
                return {
                    _id: permissionData._id,
                    metaName: permissionData.metaName,
                    name: permissionData.name,
                    isAssignable: permissionData.isAssignable,
                };
            }),
        };
    });
};

export default CheckParticipants;
