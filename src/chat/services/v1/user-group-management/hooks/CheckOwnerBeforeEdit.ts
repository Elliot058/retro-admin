/**
 * Created By Abhilash(abhilash@smartters.in) on 27-12-2022 at 16:07
 */

import { HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import { UserGroup_GET, UserGroupStatus } from '../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import { userGroupPath } from '../../../../service_endpoints/services';

const CheckOwnerBeforeEdit = () => async (context: HookContext) => {
    const { app, id, params } = context;
    const { user } = params;

    const groupData: UserGroup_GET = await app
        .service(userGroupPath)
        ._get(id, { query: { status: UserGroupStatus.ACTIVE } });

    if (groupData) {
        if (!user) {
            return context;
        }
        if (groupData.createdBy.toString() !== user?._id?.toString()) {
            throw new BadRequest('You are not the owner of the group');
        }
    }
};

export default CheckOwnerBeforeEdit;
