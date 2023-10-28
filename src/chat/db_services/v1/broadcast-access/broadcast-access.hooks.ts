import { disallow, discard, iff, isProvider } from 'feathers-hooks-common';
import PatchDeleted from '../../../hooks/PatchDeleted';
import SetCreatedBy from '../../../hooks/SetCreatedBy';

export default {
    before: {
        all: [iff(isProvider('external'), disallow())],
        find: [],
        get: [],
        create: [discard('status'), SetCreatedBy('createdBy')],
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
