import { disallow, discard, iff, isProvider } from 'feathers-hooks-common';
import PatchDeleted from '../../../hooks/PatchDeleted';

export default {
    before: {
        all: [iff(isProvider('external'), disallow())],
        find: [],
        get: [],
        create: [discard('status')],
        update: [],
        patch: [],
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
