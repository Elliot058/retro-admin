/**
 * Created By Soumya(soumya@smartters.in) on 3/6/2023 at 3:30 PM.
 */
import { HookContext } from '@feathersjs/feathers';
import {
    UserGroup_GET,
    UserGroup_POST,
    UserGroupStatus,
} from '../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import { User_GET } from '../../../../db_services/v1/user/interfaces/UserInterfaces';
import { userGroupPath } from '../../../../service_endpoints/services';
import { BadRequest } from '@feathersjs/errors';

/**
 * Check parent group of channels.
 * @constructor
 */
const CheckParentGroup = () => async (context: HookContext) => {
    const { app, params } = context;

    const userGroupData = context.data as UserGroup_POST;
    const { parentId } = userGroupData;

    const userData = params?.user as User_GET;

    const groupData: UserGroup_GET = await app
        .service(userGroupPath)
        ._get(parentId, {
            query: {
                status: UserGroupStatus.ACTIVE,
            },
        })
        .catch(() => {
            throw new BadRequest('Given group does not exist.');
        });

    const { createdBy } = groupData;
    if (createdBy.toString() !== userData._id.toString()) {
        throw new BadRequest('You can not add channels to this group.');
    }

    userGroupData.parentData = groupData;
    context.data = userGroupData;

    return context;
};

export default CheckParentGroup;
