/**
 * Created By Soumya(soumya@smartters.in) on 1/17/2023 at 8:02 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { broadcastAccessPath } from '../../../../../../service_endpoints/services';
import { BadRequest } from '@feathersjs/errors';
import { BroadcastAccess_GET } from '../../../../../../db_services/v1/broadcast-access/interfaces/BroadcastAccessInterface';
import { BroadcastChatAccess_PATCH } from '../interfaces/BroadcastChatAccessInterface';
import { Broadcast_GET } from '../../../../../../db_services/v1/broadcast/interfaces/BroadCastInterface';

/**
 * Get broadcast data from broadcast access details.
 * @constructor
 */
const GetBroadcastFromBroadcastAccess = () => async (context: HookContext) => {
    const { id, app } = context;
    const data = context.data as BroadcastChatAccess_PATCH;

    if (!id) throw new BadRequest('Invalid group remove operation from broadcast.');

    const broadcastAccessService: Service & ServiceAddons<any> = app.service(broadcastAccessPath);
    data.broadcastData = await broadcastAccessService
        ._get(id.toString(), {
            query: {
                $populate: ['broadcast'],
            },
        })
        .then((res: BroadcastAccess_GET) => res.broadcast as Broadcast_GET)
        .catch(() => {
            throw new BadRequest('Invalid broadcast access.');
        });
};

export default GetBroadcastFromBroadcastAccess;
