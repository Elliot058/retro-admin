/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 9:32 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { BroadcastChatAccess_POST } from '../interfaces/BroadcastChatAccessInterface';
import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { broadcastAccessPath } from '../../../../../../service_endpoints/services';
import {
    BroadcastAccess_FIND,
    BroadcastAccess_POST,
    BroadcastAccess_QUERY,
    BroadcastAccessStatus,
} from '../../../../../../db_services/v1/broadcast-access/interfaces/BroadcastAccessInterface';
import { Types } from 'mongoose';
import { BadRequest } from '@feathersjs/errors';
import { UserGroup_GET } from '../../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';

/**
 * Create group access.
 * @constructor
 */
const CheckGroupsAlreadyExistOrNot = () => async (context: HookContext) => {
    const { app, data, params } = context;
    const { groups, broadcastData } = data as BroadcastChatAccess_POST;
    const userData = params.user as User_GET;
    if (!userData) return context;

    const broadcastAccessService: Service & ServiceAddons<any> = app.service(broadcastAccessPath);
    for (const each of groups) {
        const broadcastAccessQuery: BroadcastAccess_QUERY = {
            broadcast: broadcastData._id,
            group: new Types.ObjectId(each),
            status: BroadcastAccessStatus.ACTIVE,
        };
        const groupExists = await broadcastAccessService
            ._find({
                query: {
                    ...broadcastAccessQuery,
                    $populate: 'group',
                    $limit: 1,
                },
            })
            .then((res: BroadcastAccess_FIND) => (res.total ? res.data[0] : null));
        if (groupExists) throw new BadRequest(`Group ${(groupExists.group as UserGroup_GET).name} already exists.`);
    }

    const broadcastAccessData: Array<BroadcastAccess_POST> = groups?.map((e) => {
        return {
            broadcast: broadcastData._id,
            group: new Types.ObjectId(e),
        };
    });

    context.result = await broadcastAccessService.create(broadcastAccessData, {
        query: {
            $limit: groups.length,
        },
        user: params.user,
        provider: undefined,
    });
};

export default CheckGroupsAlreadyExistOrNot;
