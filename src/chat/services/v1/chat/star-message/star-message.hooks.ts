import * as authentication from '@feathersjs/authentication';
import FRequiredQuery from '../../../../hooks/FRequiredQuery';
import { disallow } from 'feathers-hooks-common';
import SetCreatedBy from '../../../../hooks/SetCreatedBy';
import FRequired from '../../../../hooks/FRequired';
import SetCreatedByQuery from '../../../../hooks/SetCreatedByQuery';
import CheckUserCanStarTheMessage from './hooks/CheckUserCanStarTheMessage';
import GetAllStarredMessagesOfGroup from './hooks/GetAllStarredMessagesOfGroup';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [FRequiredQuery(['group']), GetAllStarredMessagesOfGroup()],
        get: [disallow()],
        create: [SetCreatedBy('user'), FRequired(['message']), CheckUserCanStarTheMessage()],
        update: [disallow()],
        patch: [disallow()],
        remove: [SetCreatedByQuery('user')],
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
