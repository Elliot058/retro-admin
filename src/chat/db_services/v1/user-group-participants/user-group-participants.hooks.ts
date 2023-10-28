import * as authentication from '@feathersjs/authentication';
import PatchDeleted from '../../../hooks/PatchDeleted';
import { disallow, discard, iff, isProvider } from 'feathers-hooks-common';
import CheckPermissions from './hooks/CheckPermissions';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt'), iff(isProvider('external'), iff(isProvider('server')).else(disallow()))],
        find: [],
        get: [],
        create: [CheckPermissions()],
        update: [],
        patch: [discard('participant'), discard('group')],
        remove: [PatchDeleted()],
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
