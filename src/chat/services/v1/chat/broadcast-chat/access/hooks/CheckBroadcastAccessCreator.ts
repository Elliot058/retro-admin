/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 9:28 PM.
 */
import { HookContext } from '@feathersjs/feathers';
import { BroadcastChatAccess_POST } from '../interfaces/BroadcastChatAccessInterface';
import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { BadRequest } from '@feathersjs/errors';

/**
 * Check the user who is creating broadcast.
 * @constructor
 */
const CheckBroadcastAccessCreator = () => async (context: HookContext) => {
    const { data, params } = context;
    const { broadcastData } = data as BroadcastChatAccess_POST;

    const userData = params.user as User_GET;
    if (!userData) return context;

    if (broadcastData.createdBy.toString() !== userData._id.toString()) {
        throw new BadRequest('You can not add or delete groups to this broadcast.');
    }
};

export default CheckBroadcastAccessCreator;
