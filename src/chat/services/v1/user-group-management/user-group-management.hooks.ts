import * as authentication from '@feathersjs/authentication';
import { disallow, discard, iff, isProvider } from 'feathers-hooks-common';
import Permit from '../../../hooks/Permit';
import SetCreatedBy from '../../../hooks/SetCreatedBy';
import FRequired from '../../../hooks/FRequired';
import SetDefaultQuery from '../../../hooks/SetDefaultQuery';
import { UserGroupStatus, UserGroupType } from '../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import SetQuery from '../../../hooks/SetQuery';
import hasData from '../../../utils/hasData';
import CheckOwnerBeforeEdit from './hooks/CheckOwnerBeforeEdit';
import CheckPermissionsOnGroupCreate from './hooks/CheckPermissionsOnGroupCreate';
import ModuleValidateData from '../../../hooks/ModuleValidateData';
import { userpath } from '../../../service_endpoints/services';
import hasDataExists from '../../../utils/hasDataExists';
import CheckParentGroup from './hooks/CheckParentGroup';
import CheckParticipantsOfGroup from './hooks/CheckParticipantsOfGroup';
import SetDefaultItem from "../../../hooks/SetDefaultItem";
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [],
        find: [
            authenticate('jwt'),
            iff(Permit.is(Permit.USER), SetQuery('status', UserGroupStatus.ACTIVE)),
            iff(
                Permit.is(Permit.ADMIN, Permit.SUPER_ADMIN),
                SetDefaultQuery('status', { $ne: UserGroupStatus.DELETED }),
            ).else(SetQuery('status', UserGroupStatus.ACTIVE)),
        ],
        get: [
            authenticate('jwt'),
            iff(Permit.is(Permit.USER), SetQuery('status', UserGroupStatus.ACTIVE)),
            iff(
                Permit.is(Permit.ADMIN, Permit.SUPER_ADMIN),
                SetDefaultQuery('status', { $ne: UserGroupStatus.DELETED }),
            ).else(SetQuery('status', UserGroupStatus.ACTIVE)),
        ],
        create: [
            authenticate('jwt'),
            Permit.USER,
            SetCreatedBy('createdBy'),
            FRequired(['type']),
            iff(hasData('type', UserGroupType.PRIVATE_GROUP_CHAT, UserGroupType.PUBLIC_GROUP_CHAT), FRequired('name')),
            iff(
                hasData('type', UserGroupType.PERSONAL_CHAT),
                FRequired(['firstUser', 'secondUser']),
                iff(isProvider('external'), disallow()),
            ),
            iff(
                hasDataExists('parentId'),
                iff(hasData('type', UserGroupType.PRIVATE_GROUP_CHAT, UserGroupType.PUBLIC_GROUP_CHAT)).else(
                    disallow(),
                ),
                CheckParentGroup(),
                CheckParticipantsOfGroup(),
            ).else(CheckPermissionsOnGroupCreate()),
            SetDefaultItem('isTeam', false),
            discard('status'),
        ],
        update: [disallow()],
        patch: [
            authenticate('jwt'),
            Permit.USER,
            // SetCreatedByQuery('createdBy'),
            CheckOwnerBeforeEdit(),
            // iff(hasData('type', UserGroupType.PRIVATE_GROUP_CHAT), SetQuery('type', UserGroupType.PUBLIC_GROUP_CHAT)),
            // iff(hasData('type', UserGroupType.PUBLIC_GROUP_CHAT), SetQuery('type', UserGroupType.PRIVATE_GROUP_CHAT)),
            iff(hasData('type', UserGroupType.PERSONAL_CHAT), disallow()),
            SetCreatedBy('updatedBy'),
        ],
        remove: [authenticate('jwt'), Permit.USER, CheckOwnerBeforeEdit()],
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
