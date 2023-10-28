import { Forbidden, NotAuthenticated } from '@feathersjs/errors';
import { PermitType, UserRole } from '../db_services/v1/user/interfaces/UserInterfaces';
import { HookContext } from '@feathersjs/feathers';

const Permit =
    (...roles: UserRole[]) =>
    (context: HookContext, strict = false) => {
        const {
            params: { user },
        } = context;

        if (!user) throw new NotAuthenticated();
        // if (!strict && user.role === UserRole.SUPER_ADMIN) return context;

        if (roles && roles.length) {
            if (roles.indexOf(user.role) < 0) throw new Forbidden();
            return context;
        }

        return context;
    };

Permit.USER = Permit(UserRole.USER);
Permit.ADMIN = Permit(UserRole.ADMIN);
Permit.SUPER_ADMIN = Permit(UserRole.SUPER_ADMIN);

Permit.or =
    (...roles: PermitType[]) =>
    async (context: HookContext) => {
        const {
            params: { user },
        } = context;

        if (!user) throw new NotAuthenticated();

        const result = await Promise.all(
            roles.map(async (each) => {
                try {
                    await each(context);
                    return true;
                } catch (e) {
                    return false;
                }
            }),
        );

        if (!result.filter(Boolean).length) throw new Forbidden();

        return context;
    };

/**
 *
 * @param roles
 * @returns {function(*=): boolean}
 */
Permit.is =
    (...roles: PermitType[]) =>
    async (context: HookContext) => {
        const {
            params: { user },
        } = context;

        if (!user) throw new NotAuthenticated();

        const result = await Promise.all(
            roles.map(async (each) => {
                try {
                    await each(context);
                    return true;
                } catch (e) {
                    return false;
                }
            }),
        );

        return !!result.filter(Boolean).length;
    };

Permit.not = (role: PermitType) => async (context: HookContext) => {
    const {
        params: { user },
    } = context;

    if (!user) throw new NotAuthenticated();

    try {
        await role(context, true);
        return false;
    } catch (e) {
        return true;
    }
};

export default Permit;
