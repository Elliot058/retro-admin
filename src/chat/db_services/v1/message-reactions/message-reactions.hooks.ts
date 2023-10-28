import { disallow, iff, isProvider } from 'feathers-hooks-common';
import SetDefaultItem from '../../../hooks/SetDefaultItem';
import { MessageReactionStatus } from './interfaces/MessageReactionInterface';
import PatchDeleted from '../../../hooks/PatchDeleted';
import CheckIfReactionAlreadyGiven from './hooks/CheckIfReactionAlreadyGiven';
// Don't remove this comment. It's needed to format import lines nicely.

export default {
    before: {
        all: [iff(isProvider('external'), disallow())],
        find: [],
        get: [],
        create: [SetDefaultItem('status', MessageReactionStatus.ACTIVE), CheckIfReactionAlreadyGiven()],
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
