/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 3:01 PM.
 */
import { HookContext } from '@feathersjs/feathers';

/**
 * Create participant array.
 * @constructor
 */
const JoinGroup = () => async (context: HookContext) => {
    const { params } = context;
    const { user } = params;

    if (!user) return context;

    context.data.participants = [user._id];
};

export default JoinGroup;
