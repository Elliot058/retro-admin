import * as authentication from '@feathersjs/authentication';
import { disallow } from 'feathers-hooks-common';
import GetAllChatsForTheUser from './hooks/GetAllChatsForTheUser';
import FRequiredQuery from '../../../../hooks/FRequiredQuery';
import { HookContext } from '@feathersjs/feathers';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [
            authenticate('jwt'),
            (ctx: HookContext) => {
                // console.log(ctx.params.query);
            },
        ],
        find: [FRequiredQuery(['type']), GetAllChatsForTheUser()],
        get: [FRequiredQuery(['type']), GetAllChatsForTheUser()],
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
