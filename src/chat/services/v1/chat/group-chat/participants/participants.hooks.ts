import * as authentication from '@feathersjs/authentication';
import { disallow, discard, iff } from 'feathers-hooks-common';
import SetCreatedBy from '../../../../../hooks/SetCreatedBy';
import FRequired from '../../../../../hooks/FRequired';
import ModuleValidateData from '../../../../../hooks/ModuleValidateData';
import CheckTheUserUpdatingParticipants from './hooks/CheckTheUserUpdatingParticipants';
import CheckParticipants from './hooks/CheckParticipants';
import { groupPermissionsPath, userGroupPath, userpath } from '../../../../../service_endpoints/services';
import hasDataExists from '../../../../../utils/hasDataExists';
import GetUserDataAndParticipants from './hooks/GetUserDataAndParticipants';
import CheckIfAddingParticipantToChannel from './hooks/CheckIfAddingParticipantToChannel';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [disallow()],
        get: [disallow()],
        create: [
            SetCreatedBy('createdBy'),
            FRequired(['participants', 'group']),
            ModuleValidateData(userpath, 'participants'),
            ModuleValidateData(userGroupPath, 'group'),
            CheckIfAddingParticipantToChannel(),
            GetUserDataAndParticipants(),
            CheckTheUserUpdatingParticipants(),
            discard('status'),
            CheckParticipants(),
        ],
        update: [disallow()],
        patch: [
            iff(hasDataExists('permissions'), ModuleValidateData(groupPermissionsPath, 'permissions')),
            SetCreatedBy('updatedBy'),
            GetUserDataAndParticipants(),
            CheckTheUserUpdatingParticipants(),
        ],
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
