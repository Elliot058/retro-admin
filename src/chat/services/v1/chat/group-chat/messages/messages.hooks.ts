import * as authentication from '@feathersjs/authentication';
import GetMessagesOfTheGroup from './hooks/GetMessagesOfTheGroup';
import FRequiredQuery from '../../../../../hooks/FRequiredQuery';
import { disallow } from 'feathers-hooks-common';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [FRequiredQuery(['group']), GetMessagesOfTheGroup()],
        get: [disallow()],
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
