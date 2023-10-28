/**
 * Created By Soumya(soumya@smartters.in) on 1/15/2023 at 6:08 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import {
    UserGroupParticipant_GET,
    UserGroupParticipantStatus,
} from '../../../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import { BadRequest } from '@feathersjs/errors';
import { Service } from 'feathers-mongoose';
import { userGroupParticipantsPath } from '../../../../../../service_endpoints/services';
import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';

const LeaveGroup = () => async (context: HookContext) => {
    const { app, params, id } = context;

    if (!id) throw new BadRequest('Invalid leave operation.');

    const { user } = params;
    if (!user) return context;
    const userData = user as User_GET;

    const userParticipantService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);
    const userParticipantData = await userParticipantService
        ._get(id.toString(), {
            query: {
                $populate: ['group'],
            },
        })
        .then((res: UserGroupParticipant_GET) => res)
        .catch(() => {
            throw new BadRequest('User participant not found.');
        });

    if (userParticipantData.participant.toString() !== userData._id.toString()) {
        throw new BadRequest('You can not leave this group.');
    }

    params.participants = await userParticipantService
        ._find({
            query: {
                group: userParticipantData.group,
                status: UserGroupParticipantStatus.ACTIVE,
                $select: ['participant'],
            },
            paginate: false,
        })
        .then((res: Array<UserGroupParticipant_GET>) => res.map((e) => e.participant.toString()));

    context.data = {
        status: UserGroupParticipantStatus.LEFT,
    };

    return context;
};

export default LeaveGroup;
