/**
 * Created By Abhilash(abhilash@smartters.in) on 30-12-2022 at 13:25
 */
/**
 * Create a personal chat for the sender and receiver.
 */

import { HookContext } from '@feathersjs/feathers';
import { UserGroup_FIND, UserGroup_GET, UserGroupType } from '../../user-group/interfaces/UserGroupInterface';
import { userGroupPath } from '../../../../service_endpoints/services';

const CreatePersonalChat = () => async (context: HookContext) => {
    const { app, data, params } = context;
    const user = params.user;

    const query = {
        $or: [
            { firstUser: data.sender, secondUser: data.recipient },
            { firstUser: data.recipient, secondUser: data.sender },
        ],
    };

    const groupData: UserGroup_GET = await app
        .service(userGroupPath)
        ._find({ query })
        .then((res: UserGroup_FIND) => (res.total > 0 ? res.data[0] : null));

    if (groupData) {
        data.entityId = groupData._id;
    } else {
        const groupCreateData = {
            type: UserGroupType.PERSONAL_CHAT,
            createdBy: user?._id,
            firstUser: data.sender,
            secondUser: data.recipient,
        };
        const newGroup: UserGroup_GET = await app.service(userGroupPath)._create(groupCreateData, params);
        data.entityId = newGroup._id;
    }
};

export default CreatePersonalChat;
