import * as authentication from '@feathersjs/authentication';
import GetPersonalChatUserDetails from './hooks/GetPersonalChatUserDetails';
import GetUserGroupForPersonalChat from './hooks/GetUserGroupForPersonalChat';
import { disallow, iff, isProvider } from 'feathers-hooks-common';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [iff(isProvider('external'), disallow())],
        get: [GetPersonalChatUserDetails()],
        create: [GetUserGroupForPersonalChat()],
        update: [iff(isProvider('external'), disallow())],
        patch: [iff(isProvider('external'), disallow())],
        remove: [],
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
