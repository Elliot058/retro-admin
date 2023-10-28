/**
 * Created By Soumya(soumya@smartters.in) on 1/17/2023 at 8:33 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Broadcast_POST } from '../../../../db_services/v1/broadcast/interfaces/BroadCastInterface';
import { User_GET } from '../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { userGroupParticipantsPath } from '../../../../service_endpoints/services';
import {
    UserGroupParticipant_FIND,
    UserGroupParticipant_QUERY,
    UserGroupParticipantStatus,
} from '../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import { BadRequest } from '@feathersjs/errors';

/**
 * Check if the user is the participant of the groups or not.
 * @constructor
 */
const CheckIfUserParticipantOfGroups = () => async (context: HookContext) => {
    const { app, data, params } = context;
    let { groupsData } = data as Broadcast_POST;
    if (!groupsData) return context;

    const userData = params.user as User_GET;
    if (!userData) return context;

    if (!Array.isArray(groupsData)) groupsData = [groupsData];

    const userParticipantService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);
    for (const each of groupsData) {
        const userGroupParticipantQuery: UserGroupParticipant_QUERY = {
            group: each._id,
            participant: userData._id,
            status: UserGroupParticipantStatus.ACTIVE,
        };
        const userParticipantData = await userParticipantService
            ._find({
                query: {
                    ...userGroupParticipantQuery,
                    $limit: 1,
                },
            })
            .then((res: UserGroupParticipant_FIND) => (res.total ? res.data[0] : null));
        if (!userParticipantData) {
            throw new BadRequest('You must be a member of the group to add it to your broadcast.');
        }
    }
};

export default CheckIfUserParticipantOfGroups;
