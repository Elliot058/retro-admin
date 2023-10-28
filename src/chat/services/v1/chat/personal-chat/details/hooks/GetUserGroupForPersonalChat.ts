/**
 * Created By Soumya(soumya@smartters.in) on 1/9/2023 at 4:49 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { userGroupPath } from '../../../../../../service_endpoints/services';
import {
    UserGroup_FIND,
    UserGroup_GET,
    UserGroupType,
} from '../../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';

const GetUserGroupForPersonalChat = () => async (context: HookContext) => {
    const { data, app, params } = context;
    const { recipient } = data;
    const { user } = params;

    if (!user) return context;

    const userData = user as User_GET;

    const userGroupService: Service & ServiceAddons<any> = app.service(userGroupPath);
    const query = {
        $or: [
            { firstUser: userData._id, secondUser: recipient },
            { firstUser: recipient, secondUser: userData._id },
        ],
    };
    const userGroupData = await userGroupService
        ._find({
            query: query,
        })
        .then((res: UserGroup_FIND) => (res.total ? res.data[0] : null));
    if (userGroupData) {
        context.result = {
            group: userGroupData._id,
        };
    } else {
        const groupCreateData = {
            type: UserGroupType.PERSONAL_CHAT,
            createdBy: user?._id,
            firstUser: userData._id,
            secondUser: recipient,
        };
        const newGroup: UserGroup_GET = await userGroupService._create(groupCreateData, params);
        context.result = {
            group: newGroup._id,
        };
    }
};

export default GetUserGroupForPersonalChat;
