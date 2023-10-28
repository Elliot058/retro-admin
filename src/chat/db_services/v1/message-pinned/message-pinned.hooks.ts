import { disallow, iff, isProvider } from 'feathers-hooks-common';
import SetDefaultItem from '../../../hooks/SetDefaultItem';
import { MessagePinnedStatus } from './interfaces/MessagePinnedInterface';
import PatchDeleted from '../../../hooks/PatchDeleted';

export default {
    before: {
        all: [iff(isProvider('external'), disallow())],
        find: [],
        get: [],
        create: [SetDefaultItem('status', MessagePinnedStatus.ACTIVE)],
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
