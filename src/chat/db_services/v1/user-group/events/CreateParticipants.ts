/**
 * Created By Abhilash(abhilash@smartters.in) on 27-12-2022 at 19:07
 */

import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { UserGroup_GET, UserGroupType } from '../interfaces/UserGroupInterface';
import { userGroupParticipantsPath } from '../../../../service_endpoints/services';
import {
    GroupPermissionStatus,
    GroupPermissionType,
} from '../../group-permissions/interfaces/GroupPermissionInterface';
import { UserGroupParticipant_GET } from '../../user-group-participants/interfaces/UserGroupParticipantInterface';
import { Service } from 'feathers-mongoose';
import createGroupCreationMessage from '../utils/createGroupCreationMessage';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import createGroupParticipantAdditionMessage from '../utils/createGroupParticipantAdditionMessage';
import getAllGroupPermissions from '../../group-permissions/utils/getAllGroupPermissions';

const CreateParticipants = async (result: UserGroup_GET, context: HookContext) => {
    const { app, data, params } = context;

    const { parentId } = result;

    const participants: Array<string> = data.participants;
    const userData = params.user as User_GET;
    if (!userData) return context;

    const user = context.params.user?._id;
    const group = result._id;

    const { type } = result;
    if (type === UserGroupType.PERSONAL_CHAT) return context;

    // participants.push(user);
    const uniqueParticipants: Array<string> = Array.from(new Set(participants));

    const query = {
        // check if the participant is group creator then fetch all permissions
        // otherwise get only the assignable permissions.
        isAssignable: { $in: [true, false] },
        status: GroupPermissionStatus.ACTIVE,
        $select: ['_id'],
        type: parentId ? GroupPermissionType.CHANNEL : GroupPermissionType.GROUP,
    };

    const permissionsData = await getAllGroupPermissions(app, query);

    const permissions = permissionsData.map((e) => e._id);

    const userParticipantService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);
    const participant: UserGroupParticipant_GET = await userParticipantService.create(
        {
            permissions,
            group,
            participant: user,
            createdBy: context.params.user?._id,
        },
        {
            ...context.params,
            provider: undefined,
            query: {
                $populate: [
                    {
                        path: 'participant',
                        select: ['name', 'avatar'],
                    },
                    {
                        path: 'group',
                        populate: ['parentId'],
                    },
                ],
            },
        },
    );

    const createData: Array<object> = [];
    uniqueParticipants
        .filter((e, i, self) => self.indexOf(e) === i)
        .map((participant) => {
            if (user.toString() !== participant.toString()) {
                createData.push({
                    permissions: user.toString() === participant.toString() ? permissions : data.permissions,
                    group,
                    participant,
                    createdBy: context.params.user?._id,
                });
            }
        });
    let participantData: Array<UserGroupParticipant_GET> = [];
    if (createData.length) {
        participantData = await userParticipantService.create(createData, {
            ...context.params,
            provider: undefined,
            query: {
                $limit: createData.length,
                $populate: [
                    {
                        path: 'participant',
                        select: ['name', 'avatar'],
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
        });
    }

    // console.log('ParticipantData', participantData);

    if (!result.isTeam) {
        await createGroupCreationMessage(
            app,
            result,
            userData,
            participantData.map((e) => e.participant?._id),
        );

        for (const each of participantData) {
            const otherParticipants = participantData.filter(
                (e) => e.participant?._id.toString() !== each.participant?._id.toString(),
            );
            await createGroupParticipantAdditionMessage(
                app,
                result,
                userData,
                each.participant as User_GET,
                otherParticipants.map((e) => e.participant?._id),
            );
        }
    }
};

export default CreateParticipants;
