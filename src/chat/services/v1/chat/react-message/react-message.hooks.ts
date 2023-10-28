import * as authentication from '@feathersjs/authentication';
import { disallow, discard } from 'feathers-hooks-common';
import SetCreatedByQuery from '../../../../hooks/SetCreatedByQuery';
import SetCreatedBy from '../../../../hooks/SetCreatedBy';
import FRequired from '../../../../hooks/FRequired';
import CheckUserCanReactOnTheMessage from './hooks/CheckUserCanReactOnTheMessage';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [disallow()],
        get: [disallow()],
        create: [
            SetCreatedBy('reactor'),
            FRequired(['message', 'emoji']),
            CheckUserCanReactOnTheMessage(),
            discard('status'),
        ],
        update: [disallow()],
        patch: [disallow()],
        remove: [SetCreatedByQuery('reactor')],
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
