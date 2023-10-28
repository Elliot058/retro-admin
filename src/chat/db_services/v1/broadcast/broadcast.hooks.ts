import { disallow, discard, iff, isProvider } from 'feathers-hooks-common';
import PatchDeleted from '../../../hooks/PatchDeleted';
import { HookContext } from '@feathersjs/feathers';

export default {
    before: {
        all: [iff(isProvider('external'), disallow())],
        find: [],
        get: [],
        create: [discard('status', 'groupCount')],
        update: [],
        patch: [discard('status', 'groupCount')],
        remove: [PatchDeleted()],
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [
            (ctx: HookContext) => {
                const { data } = ctx;
                ctx.result.groupCount = data.groups.length;
            },
        ],
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
