import { disallow, iff, isProvider } from 'feathers-hooks-common';
import SetDefaultItem from '../../../hooks/SetDefaultItem';
import PatchDeleted from '../../../hooks/PatchDeleted';
import { MessageStarredStatus } from './interfaces/MessageStarredInterface';

export default {
    before: {
        all: [iff(isProvider('external'), disallow())],
        find: [],
        get: [],
        create: [SetDefaultItem('status', MessageStarredStatus.ACTIVE)],
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
