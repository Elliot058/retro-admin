import * as authentication from '@feathersjs/authentication';
import { disallow } from 'feathers-hooks-common';
import FRequiredQuery from '../../../../../hooks/FRequiredQuery';
import FindBroadcastMessages from './hooks/FindBroadcastMessages';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [FRequiredQuery(['broadcast']), FindBroadcastMessages()],
        get: [],
        create: [
            // Create message handled through the hook of db_service.
        ],
        update: [disallow()],
        patch: [
            // Edit message handled through the hook of db_service.
        ],
        remove: [disallow()],
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
