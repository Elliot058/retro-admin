/**
 * Created By Soumya (soumyaranjansahoo338@gmail.com) on 12/3/2020 at 12:35 AM
 */
import { BadRequest, FeathersError } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';

/**
 * @description check if email exists in db or not.
 * @constructor
 */
const CheckIfEmailExists = () => async (context: HookContext) => {
    const { data, app } = context;

    const { email } = data;

    const userData = await app
        .service('v1/user')
        ._find({
            query: {
                email,
            },
            paginate: false,
        })
        .then((res: any) => (res.length ? res[0] : null));

    if (!userData) {
        throw new FeathersError(
            'Can not find your account. Please register to continue.',
            'TooEarly',
            425,
            '',
            undefined,
        );
    }

    if (userData.status === 2) throw new BadRequest("You can't login as you're blocked by admin.");
};

export default CheckIfEmailExists;
