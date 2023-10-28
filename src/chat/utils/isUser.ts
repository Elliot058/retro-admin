/**
 * Created By Soumya(soumya@smarttersstudio.com) on 03-02-2022 at 14:00.
 */
import { HookContext } from '@feathersjs/feathers';

const roleNames: any = {
    1: 'super-admin',
    2: 'admin',
    3: 'user',
};

/**
 * @description check if the user is an admin or not.
 * @param roles {"super-admin"|"admin"|"user"}
 */
const isUser =
    (...roles: string[]) =>
    (context: HookContext): boolean => {
        const { params } = context;

        if (typeof params.provider === 'undefined') return true;

        const { user } = params;

        if (!user) return false;

        if (!user.role || user.role === 0) return false;

        const role = roleNames[user.role];

        return roles.indexOf(role) >= 0;
    };

export default isUser;
