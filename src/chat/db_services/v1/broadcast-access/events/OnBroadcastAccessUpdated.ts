/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 6:53 PM.
 */
import {
    BroadcastAccess_FIND,
    BroadcastAccess_GET,
    BroadcastAccess_QUERY,
    BroadcastAccessStatus,
} from '../interfaces/BroadcastAccessInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { broadcastAccessPath, broadcastPath } from '../../../../service_endpoints/services';
import { Types } from 'mongoose';
import { Broadcast_PATCH } from '../../broadcast/interfaces/BroadCastInterface';

/**
 * on broad cast access or created or deleted update group count.
 * @param result
 * @param context
 * @constructor
 */
const OnBroadcastAccessUpdated = async (result: BroadcastAccess_GET, context: HookContext) => {
    const { app, data, method } = context;
    const { broadcast, group } = result;

    if (method === 'patch' && !data.status) return context;

    if (!group) return context;
    const broadcastId = broadcast?._id ? broadcast?._id : broadcast;

    const broadcastAccessService: Service & ServiceAddons<any> = app.service(broadcastAccessPath);
    const broadcastService: Service & ServiceAddons<any> = app.service(broadcastPath);

    const broadcastAccessQuery: BroadcastAccess_QUERY = {
        broadcast: broadcastId as Types.ObjectId,
        status: BroadcastAccessStatus.ACTIVE,
    };
    const groupCount = await broadcastAccessService
        ._find({
            query: {
                ...broadcastAccessQuery,
                $limit: 0,
            },
        })
        .then((res: BroadcastAccess_FIND) => res.total);

    const broadcastUpdatedData: Broadcast_PATCH = {
        groupCount,
    };
    await broadcastService._patch(broadcastId.toString(), {
        ...broadcastUpdatedData,
    });
};

export default OnBroadcastAccessUpdated;
