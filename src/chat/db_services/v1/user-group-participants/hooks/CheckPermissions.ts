/**
 * Created By Abhilash(abhilash@smartters.in) on 29-12-2022 at 13:07
 */

import { HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import { UserGroup_FIND, UserGroup_GET, UserGroupStatus } from '../../user-group/interfaces/UserGroupInterface';
import { discard } from 'feathers-hooks-common';
import {
    GroupPermission_GET,
    GroupPermissionStatus,
    GroupPermissionType,
} from '../../group-permissions/interfaces/GroupPermissionInterface';
import ModuleValidateData from '../../../../hooks/ModuleValidateData';
import { groupPermissionsPath, userGroupPath } from '../../../../service_endpoints/services';
import { UserGroupParticipant_POST } from '../interfaces/UserGroupParticipantInterface';

/**
 * Validate the permissions for the participants.
 * @constructor
 */
const CheckPermissions = () => async (context: HookContext) => {
    const { app, data, params } = context;
    const { user } = params;

    const validatePermission = async (each: UserGroupParticipant_POST) => {
        const { group } = each;
        const { permissions, participant } = each;
        let { query } = params;

        query = {
            status: UserGroupStatus.ACTIVE,
            _id: group,
        };

        const groupData: UserGroup_GET = await app
            .service(userGroupPath)
            ._find({ query }, { paginate: false })
            .then((res: UserGroup_FIND) => (res.total > 0 ? res.data[0] : null));

        if (groupData) {
            if (groupData.createdBy.toString() !== user?._id.toString()) {
                discard('permissions')(context);
            } else {
                if (permissions) {
                    await ModuleValidateData(groupPermissionsPath, 'permissions')(context);
                } else {
                    query = {
                        // check if the participant is group creator then fetch all permissions
                        // otherwise get only the assignable permissions.
                        isAssignable:
                            groupData.createdBy.toString() === each.participant.toString()
                                ? { $in: [true, false] }
                                : true,
                        status: GroupPermissionStatus.ACTIVE,
                        $select: ['_id'],
                        type: groupData.parentId ? GroupPermissionType.CHANNEL : GroupPermissionType.GROUP,
                    };

                    const permissionsData: Array<GroupPermission_GET> = await app
                        .service(groupPermissionsPath)
                        ._find({ query, paginate: false })
                        .then((res: Array<GroupPermission_GET>) => (res.length > 0 ? res : null));

                    each = { ...each, permissions: permissionsData.map((e) => e._id) };
                }
            }

            return each;
        } else {
            throw new BadRequest('Invalid group Chosen');
        }
    };

    if (Array.isArray(data)) {
        const newData = [];
        for (let each of data) {
            each = await validatePermission(each);
            newData.push(each);
        }
        context.data = newData;
    } else {
        context.data = await validatePermission(data);
    }
};

export default CheckPermissions;
