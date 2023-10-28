import * as authentication from '@feathersjs/authentication';
import { disallow } from 'feathers-hooks-common';
import FRequiredQuery from '../../../../hooks/FRequiredQuery';
import GetAllGroupsForTheUser from './hooks/GetAllGroupsForTheUser';
import GetAllPersonalChatsForTheUser from "./hooks/GetAllPersonalChatsForTheUser";
import GetAllGroupsWithChannelsForTheUser from "./hooks/GetAllGroupsWithChannelsForTheUser";
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [FRequiredQuery(['groupTypeQuery']), GetAllGroupsForTheUser(), GetAllPersonalChatsForTheUser(), GetAllGroupsWithChannelsForTheUser()],
        get: [disallow()],
        create: [disallow()],
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
