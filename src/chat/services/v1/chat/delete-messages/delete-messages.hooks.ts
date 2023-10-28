import * as authentication from '@feathersjs/authentication';
import { disallow } from 'feathers-hooks-common';
import FRequired from '../../../../hooks/FRequired';
import HandleMessageDeleteOperation from './hooks/HandleMessageDeleteOperation';
import CheckIfMessagesNotGivenSetDeleteForMe from './hooks/CheckIfMessagesNotGivenSetDeleteForMe';
import HandleDeleteOperationForBroadcastMessage from './hooks/HandleDeleteOperationForBroadcastMessage';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [disallow()],
        get: [disallow()],
        create: [
            FRequired(['deleteType']),
            CheckIfMessagesNotGivenSetDeleteForMe(),
            HandleMessageDeleteOperation(),
            HandleDeleteOperationForBroadcastMessage(),
        ],
        update: [disallow()],
        patch: [disallow()],
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
