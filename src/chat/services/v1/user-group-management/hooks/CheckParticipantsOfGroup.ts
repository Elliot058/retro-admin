/**
 * Created By Soumya(soumya@smartters.in) on 3/6/2023 at 5:32 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { UserGroup_POST, UserGroupType } from '../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import checkIfParticipantsBelongToParentGroup from '../../../../db_services/v1/user-group/utils/checkIfParticipantsBelongToParentGroup';
import { BadRequest } from '@feathersjs/errors';
import { UserGroupParticipants } from '../../../../db_services/v1/user-group-participants/user-group-participants.class';
import { userGroupParticipantsPath } from '../../../../service_endpoints/services';
import {
    UserGroupParticipant_GET,
    UserGroupParticipantStatus,
} from '../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';

const CheckParticipantsOfGroup = () => async (context: HookContext) => {
    const { app, data } = context;
    const { participants, parentData, type } = data as UserGroup_POST;
    if (!parentData) return context;

    if (participants) {
        if (!(await checkIfParticipantsBelongToParentGroup(app, parentData, participants))) {
            throw new BadRequest('Participants are not belong to the group.');
        }
    } else {
        if (type === UserGroupType.PUBLIC_GROUP_CHAT) {
            const userGroupParticipantService: UserGroupParticipants & ServiceAddons<any> =
                app.service(userGroupParticipantsPath);
            context.data.participants = await userGroupParticipantService
                ._find({
                    query: {
                        status: UserGroupParticipantStatus.ACTIVE,
                        group: parentData._id,
                        $select: ['participant'],
                    },
                    paginate: false,
                })
                .then((res: Array<UserGroupParticipant_GET>) => res.map((e) => e.participant.toString()));
        }
    }
};

export default CheckParticipantsOfGroup;
