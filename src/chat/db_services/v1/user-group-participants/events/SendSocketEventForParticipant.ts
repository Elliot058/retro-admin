/**
 * Created By Soumya(soumya@smartters.in) on 1/15/2023 at 3:44 PM.
 */
import { UserGroupParticipant_GET, UserGroupParticipantStatus } from '../interfaces/UserGroupParticipantInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { groupJoinPath, groupPermissionsPath, userGroupPath, userpath } from '../../../../service_endpoints/services';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';
import { GroupPermission_GET } from '../../group-permissions/interfaces/GroupPermissionInterface';

const SendSocketEventForParticipant = async (result: UserGroupParticipant_GET, context: HookContext) => {
    const { app, params } = context;
    const { participant, _id, permissions, status, group } = result;

    const { participants } = params;
    if (status === UserGroupParticipantStatus.REQUESTED) return context;
    // console.log('Send socket', participants);

    const userService: Service & ServiceAddons<any> = app.service(userpath);
    const userGroupService: Service & ServiceAddons<any> = app.service(userGroupPath);

    const participantData: User_GET =
        'name' in participant ? participant : await userService._get(participant.toString());
    const groupData: UserGroup_GET = 'name' in group ? group : await userGroupService._get(group.toString());

    const allPermissionsForParticipant = [];
    for (const each of permissions) {
        let permissionData: GroupPermission_GET;
        if (each?._id) {
            permissionData = each as GroupPermission_GET;
        } else {
            const permissionService: Service & ServiceAddons<any> = app.service(groupPermissionsPath);
            permissionData = await permissionService._get(each.toString());
        }
        allPermissionsForParticipant.push({
            _id: permissionData._id,
            metaName: permissionData.metaName,
            name: permissionData.name,
            isAssignable: permissionData.isAssignable,
        });
    }

    const dataForParticipant = {
        _id,
        status,
        participant: {
            _id: participantData._id,
            name: participantData.firstName,
            avatar: participantData.avatar,
        },
        group: {
            _id: groupData._id,
            name: groupData.name,
            type: groupData.type,
            avatar: groupData.avatar,
            isTeam: groupData.isTeam || false,
            memberCount: groupData.memberCount,
            parentData:
                groupData.parentId && 'name' in groupData.parentId
                    ? {
                          _id: groupData.parentId._id,
                          name: groupData.parentId.name,
                          avatar: groupData.parentId.avatar,
                          memberCount: groupData.parentId.memberCount,
                          type: groupData.parentId.type,
                          isTeam: groupData.parentId.isTeam || false,
                      }
                    : null,
        },
        permissions: allPermissionsForParticipant,
    };

    const groupJoinService = app.service(groupJoinPath);
    await groupJoinService.update(null, dataForParticipant, {
        provider: undefined,
        participants,
    });
};

export default SendSocketEventForParticipant;
