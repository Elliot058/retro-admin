/**
 * Created By Abhilash(abhilash@smartters.in) on 27-12-2022 at 19:07
 */

import { HookContext } from '@feathersjs/feathers';
import {
    UserGroupParticipant_FIND,
    UserGroupParticipant_GET,
    UserGroupParticipantStatus,
} from '../interfaces/UserGroupParticipantInterface';
import { userGroupPath } from '../../../../service_endpoints/services';

/**
 * Update member count for the group.
 * @param result
 * @param context
 * @constructor
 */
const MemberCount = async (result: UserGroupParticipant_GET, context: HookContext) => {
    const { app, data, method } = context;

    const { group } = result;

    const status = method === 'create' ? result.status : data.status;

    if ([UserGroupParticipantStatus.ACTIVE, UserGroupParticipantStatus.LEFT].includes(status)) {
        const groupId = group?._id ? group?._id : group;

        const query = {
            group: groupId,
            status: UserGroupParticipantStatus.ACTIVE,
            $limit: 0,
        };

        const member: number = await app
            .service('v1/user-group-participants')
            ._find({ query })
            .then((res: UserGroupParticipant_FIND) => res.total);

        await app.service(userGroupPath)._patch(result.group, { memberCount: member });
    }
};

export default MemberCount;
