/**
 * Created By Abhilash(abhilash@smartters.in) on 02-01-2023 at 16:12
 */

import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import {
    UserGroupParticipant_GET,
    UserGroupParticipantStatus,
} from '../../../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import { BadRequest } from '@feathersjs/errors';
import { Service } from 'feathers-mongoose';
import { userGroupParticipantsPath } from '../../../../../../service_endpoints/services';

const CheckOwnerBeforePatch = () => async (context: HookContext) => {
    const { app, id, params } = context;
    const { user } = params;
    const userGroupParticipantsService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);

    if (id) {
        const groupParticipantsData: UserGroupParticipant_GET = await userGroupParticipantsService
            ._get(id, {
                query: { status: UserGroupParticipantStatus.ACTIVE, $populate: ['group'] },
            })
            .catch(() => {
                throw new BadRequest('Invalid participant.');
            });
        context.data.groupData = groupParticipantsData.group;

        if (groupParticipantsData) {
            if (!user) {
                return context;
            }
            if ('createdBy' in groupParticipantsData.group) {
                const groupOwner = groupParticipantsData.group.createdBy;
                if (user?._id.toString() === groupParticipantsData.participant.toString()) return context;
                if (groupOwner.toString() !== user?._id?.toString()) {
                    throw new BadRequest('You are not the owner of the group');
                }
            }
        }
    } else {
        throw new BadRequest('Invalid participant for update.');
    }
};

export default CheckOwnerBeforePatch;
