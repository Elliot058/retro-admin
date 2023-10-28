/**
 * Created By Soumya(soumya@smartters.in) on 3/7/2023 at 1:33 PM.
 */
import { UserGroup_GET, UserGroup_POST, UserGroupType } from '../interfaces/UserGroupInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { userGroupPath } from '../../../../service_endpoints/services';
import { UserGroup } from '../user-group.class';

/**
 * Create general channel on a team created.
 * @param result
 * @param context
 * @constructor
 */
const CreateGeneralChannelOnTeamCreated = async (result: UserGroup_GET, context: HookContext) => {
    const { app, params } = context;

    const { participants } = context.data as UserGroup_POST;

    const { isTeam } = result;

    if (isTeam) {
        const userGroupService: UserGroup & ServiceAddons<any> = app.service(userGroupPath);
        const userGroupData: UserGroup_POST = {
            type: UserGroupType.PUBLIC_GROUP_CHAT,
            participants: participants,
            isTeam: false,
            createdBy: result.createdBy,
            parentId: result._id,
            name: 'General',
        };
        await userGroupService.create(userGroupData, {
            query: {
                ...params,
            },
        });
    }
};

export default CreateGeneralChannelOnTeamCreated;
