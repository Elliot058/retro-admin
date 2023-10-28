/**
 * Created By Soumya(soumya@smartters.in) on 3/6/2023 at 4:58 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Message_POST, MessageEntityType } from '../interfaces/MessageInterface';
import { UserGroup_FIND, UserGroup_GET, UserGroupStatus } from '../../user-group/interfaces/UserGroupInterface';
import { userGroupPath } from '../../../../service_endpoints/services';
import { UserGroup } from '../../user-group/user-group.class';
import { BadRequest } from '@feathersjs/errors';

/**
 * Check if the group has channels then direct group
 * message is not allowed.
 * @constructor
 */
const CheckIfGroupHasChannels = () => async (context: HookContext) => {
    const { app } = context;
    const { entityType, entityIdData } = context.data as Message_POST;
    if (entityType === MessageEntityType.USER_GROUP) {
        const groupData = entityIdData as UserGroup_GET;

        const userGroupService: UserGroup & ServiceAddons<any> = app.service(userGroupPath);
        const channelExists = await userGroupService
            ._find({
                query: {
                    status: UserGroupStatus.ACTIVE,
                    parentId: groupData._id,
                    $limit: 0,
                },
            })
            .then((res: UserGroup_FIND) => res.total);
        if (channelExists) {
            throw new BadRequest('You can not message in a group which consists of channels.');
        }
    }
};

export default CheckIfGroupHasChannels;
