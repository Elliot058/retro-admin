/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 1:14 PM.
 */
import { HookContext } from '@feathersjs/feathers';
import { UserGroup_POST } from '../interfaces/UserGroupInterface';

/**
 * Attach member count field in the group created response.
 * @constructor
 */
const AttachMemberCountInResponse = () => async (context: HookContext) => {
    const { participants } = context.data as UserGroup_POST;
    let memberCount = 1;
    if (participants && participants.length) {
        memberCount += participants.length;
    }
    context.result.memberCount = memberCount;
    return context;
};

export default AttachMemberCountInResponse;
