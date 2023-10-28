/**
 * Created By Soumya(soumya@smartters.in) on 1/10/2023 at 9:00 PM.
 */
import { HookContext } from '@feathersjs/feathers';

const ClearHistoryForGroup = () => async (context: HookContext) => {
    const { id, app, params } = context;
    const { user, query } = params;

    if (!user || !id || !query) return context;

    let { deleteType } = query;
    deleteType = parseInt(deleteType);

    // const me
};

export default ClearHistoryForGroup;
