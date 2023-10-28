import * as authentication from '@feathersjs/authentication';
import PatchDeleted from '../../../hooks/PatchDeleted';
import { disallow, discard, iff, isProvider } from 'feathers-hooks-common';
import AttachMemberCountInResponse from './hooks/AttachMemberCountInResponse';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt'), iff(isProvider('external'), disallow())],
        find: [],
        get: [],
        create: [discard('status')],
        update: [],
        patch: [discard('status')],
        remove: [PatchDeleted()],
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [AttachMemberCountInResponse()],
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
