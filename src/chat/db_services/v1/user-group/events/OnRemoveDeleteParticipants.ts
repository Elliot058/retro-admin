/**
 * Created By Abhilash(abhilash@smartters.in) on 02-01-2023 at 19:07
 */

import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { UserGroup_GET } from '../interfaces/UserGroupInterface';
import { Service } from 'feathers-mongoose';
import { userGroupParticipantsPath } from '../../../../service_endpoints/services';
import {
    UserGroupParticipant_GET,
    UserGroupParticipantStatus,
} from '../../user-group-participants/interfaces/UserGroupParticipantInterface';

const OnRemoveDeleteParticipants = async (result: UserGroup_GET, context: HookContext) => {
    const { app } = context;
    const { _id: id } = result;
    const userGroupParticipantsService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);

    const deleteData: Array<UserGroupParticipant_GET> = await userGroupParticipantsService._patch(
        null,
        {
            status: UserGroupParticipantStatus.LEFT,
        },
        {
            query: {
                group: id,
                status: UserGroupParticipantStatus.ACTIVE,
            },
        },
    );
};

export default OnRemoveDeleteParticipants;
