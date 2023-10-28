/**
 * Created By Abhilash(abhilash@smartters.in) on 29-12-2022 at 14:38
 */

import { HookContext } from '@feathersjs/feathers';
import {
    GroupPermission_FIND,
    GroupPermission_GET,
    GroupPermissionStatus,
} from '../../../../db_services/v1/group-permissions/interfaces/GroupPermissionInterface';
import ModuleValidateData from '../../../../hooks/ModuleValidateData';
import { groupPermissionsPath, userGroupPath } from '../../../../service_endpoints/services';

const CheckPermissionsOnGroupCreate = () => async (context: HookContext) => {
    const { app, data, params } = context;
    const { permissions } = data;
    let { query } = params;

    if (permissions) {
        await ModuleValidateData(groupPermissionsPath, permissions)(context);
    } else {
        query = {
            isAssignable: true,
            status: GroupPermissionStatus.ACTIVE,
            $select: ['_id'],
        };

        const permissionsData: Array<GroupPermission_GET> = await app
            .service(groupPermissionsPath)
            ._find({ query }, { paginate: false })
            .then((res: GroupPermission_FIND) => (res.total > 0 ? res.data : null));

        const perData: Array<string> = permissionsData.map((permissions) => {
            return permissions._id.toString();
        });

        context.data.permissions = perData;
    }
};

export default CheckPermissionsOnGroupCreate;
