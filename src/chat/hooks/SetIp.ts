/**
 * Created by Soumya (soumyaranjansahoo338@gmail.com) on 8/11/2020 at 8:37 PM
 */
import { HookContext } from '@feathersjs/feathers';

/**
 * @description set ip from params.
 * @constructor
 */
const SetIp = () => async (context: HookContext) => {
    const { data, params } = context;
    const { ip } = params;

    data.ip = ip;
    return context;
};

export default SetIp;
