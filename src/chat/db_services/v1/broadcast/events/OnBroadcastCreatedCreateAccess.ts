/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 6:39 PM.
 */
import { Broadcast_GET, Broadcast_POST } from '../interfaces/BroadCastInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { broadcastAccessPath } from '../../../../service_endpoints/services';
import { BroadcastAccess_POST } from '../../broadcast-access/interfaces/BroadcastAccessInterface';

/**
 * On broadcast created create access.
 * @param result
 * @param context
 * @constructor
 */
const OnBroadcastCreatedCreateAccess = async (result: Broadcast_GET, context: HookContext) => {
    const { app, data, params } = context;
    let { groupsData } = data as Broadcast_POST;
    if (!groupsData) return context;

    if (!Array.isArray(groupsData)) groupsData = [groupsData];

    const broadcastAccessService: Service & ServiceAddons<any> = app.service(broadcastAccessPath);

    const broadcastAccessData: Array<BroadcastAccess_POST> = groupsData?.map((e) => {
        return {
            broadcast: result._id,
            group: e._id,
        };
    });

    await broadcastAccessService.create(broadcastAccessData, {
        query: {},
        user: params.user,
        provider: undefined,
    });
};

export default OnBroadcastCreatedCreateAccess;
