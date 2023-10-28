/**
 * Created By Soumya(soumya@smartters.in) on 1/17/2023 at 9:46 PM.
 */
import { HookContext } from '@feathersjs/feathers';

const RemoveMessages = () => async (context: HookContext) => {
    const { data, app } = context;

    const { deleteType } = data;
};

export default RemoveMessages;
