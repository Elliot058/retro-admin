/**
 * Created By Abhilash(abhilash@smartters.in) on 28-12-2022 at 13:47
 */

import { HookContext } from '@feathersjs/feathers';
import { UserGroupParticipant_FIND } from '../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import { BadRequest } from '@feathersjs/errors';
import {
    GroupPermission_GET,
    GroupPermissionStatus,
} from '../../../../db_services/v1/group-permissions/interfaces/GroupPermissionInterface';

const CheckUniqueMetaName = () => async (context: HookContext) => {
    const { app, data, params } = context;
    const { user } = params;

    const query = {
        metaName: data.metaName,
        status: { $ne: GroupPermissionStatus.DELETED },
    };

    const permissionData: Array<GroupPermission_GET> = await app
        .service('v1/group-permissions')
        ._find({
            query,
        })
        .then((res: UserGroupParticipant_FIND) => (res.total === 1 ? res.data : null));

    if (permissionData) throw new BadRequest('Meta data value already exists.');
};

export default CheckUniqueMetaName;
