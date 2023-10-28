/**
 * Created By Soumya (soumyaranjansahoo338@gmail.com) on 8/24/2020 at 4:53 PM
 */

import { HookContext } from '@feathersjs/feathers';

/**
 *
 * @return {function(*): boolean}
 * @constructor
 */
const hasAccessToken = () => (context: HookContext) => {
    const { params } = context;

    const { authentication } = params;

    return authentication !== undefined;
};

export default hasAccessToken;
