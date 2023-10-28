import * as authentication from '@feathersjs/authentication';
import { disallow, discard, iff, isProvider } from 'feathers-hooks-common';
import FRequired from '../../../hooks/FRequired';
import hasData from '../../../utils/hasData';
import Permit from '../../../hooks/Permit';
import ModuleValidateData from '../../../hooks/ModuleValidateData';
import isUser from '../../../utils/isUser';
import SetId from '../../../hooks/SetId';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [],
        find: [authenticate('jwt')],
        get: [authenticate('jwt')],
        create: [
            FRequired(['name', 'email', 'role', 'password']),
            iff(hasData('role', 1), disallow()),
            iff(hasData('role', 2), authenticate('jwt'), Permit.SUPER_ADMIN),
            discard('status'),
        ],
        update: [disallow()],
        patch: [
            authenticate('jwt'),
            iff(
                isProvider('external'),
                iff(isUser('user'), SetId()).else(Permit.SUPER_ADMIN),
                iff(hasData('status', -1), disallow()),
            ),
        ],
        remove: [authenticate('jwt'), iff(isUser('user'), SetId()).else(Permit.SUPER_ADMIN)],
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },
};
