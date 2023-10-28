import * as authentication from '@feathersjs/authentication';
import { disallow, discard, iff } from 'feathers-hooks-common';
import Permit from '../../../hooks/Permit';
import SetQuery from '../../../hooks/SetQuery';
import SetDefaultQuery from '../../../hooks/SetDefaultQuery';
import { UserGroupParticipantStatus } from '../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import SetCreatedBy from '../../../hooks/SetCreatedBy';
import FRequired from '../../../hooks/FRequired';
import ModuleValidateData from '../../../hooks/ModuleValidateData';
import hasData from '../../../utils/hasData';
import CheckParticipants from '../chat/group-chat/participants/hooks/CheckParticipants';
import hasDataExists from '../../../utils/hasDataExists';
import { groupPermissionsPath } from '../../../service_endpoints/services';
import CheckOwnerBeforePatch from '../chat/group-chat/participants/hooks/CheckOwnerBeforePatch';
import CheckTheUserUpdatingParticipants from '../chat/group-chat/participants/hooks/CheckTheUserUpdatingParticipants';
import SetCreatedByQuery from '../../../hooks/SetCreatedByQuery';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [
            authenticate('jwt'),
            iff(
                Permit.is(Permit.USER),
                SetQuery('status', UserGroupParticipantStatus.ACTIVE),
                SetCreatedByQuery('participant'),
            ),
            iff(
                Permit.is(Permit.ADMIN, Permit.SUPER_ADMIN),
                SetDefaultQuery('status', { $ne: UserGroupParticipantStatus.LEFT }),
            ).else(SetQuery('status', UserGroupParticipantStatus.ACTIVE)),
        ],
        get: [
            authenticate('jwt'),
            iff(Permit.is(Permit.USER), SetQuery('status', UserGroupParticipantStatus.ACTIVE)),
            iff(
                Permit.is(Permit.ADMIN, Permit.SUPER_ADMIN),
                SetDefaultQuery('status', { $ne: UserGroupParticipantStatus.LEFT }),
            ).else(SetQuery('status', UserGroupParticipantStatus.ACTIVE)),
        ],
        create: [
            // authenticate('jwt'),
            // Permit.USER,
            // SetCreatedBy('createdBy'),
            // FRequired(['participants', 'group']),
            // ModuleValidateData('v1/user', 'participants'),
            // ModuleValidateData('v1/user-group', 'group'),
            // CheckTheUserUpdatingParticipants(),
            // discard('status'),
            // CheckParticipants(),
            disallow(),
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
