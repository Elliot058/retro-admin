import * as authentication from '@feathersjs/authentication';
import { disallow, iff } from 'feathers-hooks-common';
import SetCreatedByQuery from '../../../../hooks/SetCreatedByQuery';
import SetCreatedBy from '../../../../hooks/SetCreatedBy';
import hasData from '../../../../utils/hasData';
import FRequired from '../../../../hooks/FRequired';
import CheckUserCanPinTheMessage from './hooks/CheckUserCanPinTheMessage';
import CheckUserCanUnPinTheMessage from './hooks/CheckUserCanUnPinTheMessage';
import GetAllPinnedMessagesOfGroup from './hooks/GetAllPinnedMessagesOfGroup';
import FRequiredQuery from '../../../../hooks/FRequiredQuery';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [FRequiredQuery(['group']), GetAllPinnedMessagesOfGroup()],
        get: [disallow()],
        create: [
            SetCreatedBy('createdBy'),
            iff(hasData('pinForMeOnly', true), SetCreatedBy('user')),
            FRequired(['message']),
            CheckUserCanPinTheMessage(),
        ],
        update: [disallow()],
        patch: [disallow()],
        remove: [SetCreatedByQuery('createdBy'), CheckUserCanUnPinTheMessage()],
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
