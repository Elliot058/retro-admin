/**
 * Created By Soumya(soumya@smartters.in) on 1/2/2023 at 5:46 PM.
 */
import { UserGroupParticipant_GET, UserGroupParticipantStatus } from '../interfaces/UserGroupParticipantInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { broadcastAccessPath } from '../../../../service_endpoints/services';
import { Service } from 'feathers-mongoose';
import {
    BroadcastAccess_GET,
    BroadcastAccess_QUERY,
    BroadcastAccessStatus,
} from '../../broadcast-access/interfaces/BroadcastAccessInterface';
import { Types } from 'mongoose';

/**
 * On participant removed remove group access for broadcast.
 * @param result
 * @param context
 * @constructor
 */
const OnUserGroupParticipantLeftRemoveBroadcastAccess = async (
    result: UserGroupParticipant_GET,
    context: HookContext,
) => {
    const { app, params, method, data } = context;
    const { group, participant } = result;
    const { user } = params;

    if (method === 'patch') {
        if (!data.status || data.status !== UserGroupParticipantStatus.LEFT) return context;
    }

    if (!user) return context;
    // if (!params.provider) return context;

    // Define the services.
    const broadcastAccessService: Service & ServiceAddons<any> = app.service(broadcastAccessPath);

    // Get user data, participant data and group data.
    const groupId = group?._id ? group?._id : group;
    const participantId = participant?._id ? participant?._id : participant;

    const broadcastAccessQuery: BroadcastAccess_QUERY = {
        group: groupId as Types.ObjectId,
        status: BroadcastAccessStatus.ACTIVE,
        createdBy: participantId as Types.ObjectId,
    };
    const broadcastAccesses = await broadcastAccessService
        ._find({
            query: {
                ...broadcastAccessQuery,
                $select: ['_id'],
            },
            paginate: false,
        })
        .then((res: Array<BroadcastAccess_GET>) => res.map((e) => e._id.toString()));
    for (const each of broadcastAccesses) {
        await broadcastAccessService._patch(each, {
            status: BroadcastAccessStatus.DELETED,
        });
    }
};

export default OnUserGroupParticipantLeftRemoveBroadcastAccess;
