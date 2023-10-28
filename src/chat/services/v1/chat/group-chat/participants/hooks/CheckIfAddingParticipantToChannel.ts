/**
 * Created By Soumya(soumya@smartters.in) on 3/6/2023 at 5:46 PM.
 */
import { HookContext } from '@feathersjs/feathers';
import { UserGroup_GET } from '../../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import checkIfParticipantsBelongToParentGroup from '../../../../../../db_services/v1/user-group/utils/checkIfParticipantsBelongToParentGroup';
import { BadRequest } from '@feathersjs/errors';

const CheckIfAddingParticipantToChannel = () => async (context: HookContext) => {
    const { data, app } = context;
    const groupData = data.group as UserGroup_GET;
    const participants = data.participants as Array<string>;
    if (groupData.parentId) {
        if (!(await checkIfParticipantsBelongToParentGroup(app, groupData, participants))) {
            throw new BadRequest(`The participants are not belong the group ${groupData.name}.`);
        }
    }
};

export default CheckIfAddingParticipantToChannel;
