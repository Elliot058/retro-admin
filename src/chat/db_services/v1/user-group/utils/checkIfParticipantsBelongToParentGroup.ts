/**
 * Created By Soumya(soumya@smartters.in) on 3/6/2023 at 5:36 PM.
 */
import { Application, ServiceAddons } from '@feathersjs/feathers';
import { UserGroup_GET } from '../interfaces/UserGroupInterface';
import { UserGroupParticipants } from '../../user-group-participants/user-group-participants.class';
import { userGroupParticipantsPath } from '../../../../service_endpoints/services';
import {
    UserGroupParticipant_FIND,
    UserGroupParticipantStatus,
} from '../../user-group-participants/interfaces/UserGroupParticipantInterface';

/**
 * Check if participants are belong to the parent group.
 * @param app
 * @param groupData
 * @param participants
 */
const checkIfParticipantsBelongToParentGroup = async (
    app: Application,
    groupData: UserGroup_GET,
    participants: Array<string>,
) => {
    const userGroupParticipantService: UserGroupParticipants & ServiceAddons<any> =
        app.service(userGroupParticipantsPath);
    return await userGroupParticipantService
        ._find({
            query: {
                status: UserGroupParticipantStatus.ACTIVE,
                group: groupData._id,
                participant: {
                    $in: participants,
                },
                $limit: 0,
            },
        })
        .then((res: UserGroupParticipant_FIND) => res.total === participants.length);
};

export default checkIfParticipantsBelongToParentGroup;
