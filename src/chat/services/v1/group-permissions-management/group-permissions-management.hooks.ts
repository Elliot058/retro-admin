import { HooksObject } from '@feathersjs/feathers';
import * as authentication from '@feathersjs/authentication';
import { disallow, discard, iff } from 'feathers-hooks-common';
import Permit from '../../../hooks/Permit';
import SetQuery from '../../../hooks/SetQuery';
import SetDefaultQuery from '../../../hooks/SetDefaultQuery';
import { GroupPermissionStatus } from '../../../db_services/v1/group-permissions/interfaces/GroupPermissionInterface';
import SetCreatedBy from '../../../hooks/SetCreatedBy';
import FRequired from '../../../hooks/FRequired';
import CheckUniqueMetaName from './hooks/CheckUniqueMetaName';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [
            authenticate('jwt'),
            iff(Permit.is(Permit.USER), SetQuery('status', GroupPermissionStatus.ACTIVE)),
            iff(
                Permit.is(Permit.ADMIN, Permit.SUPER_ADMIN),
                SetDefaultQuery('status', { $ne: GroupPermissionStatus.DELETED }),
            ).else(SetQuery('status', GroupPermissionStatus.ACTIVE)),
        ],
        get: [
            authenticate('jwt'),
            iff(Permit.is(Permit.USER), SetQuery('status', GroupPermissionStatus.ACTIVE)),
            iff(
                Permit.is(Permit.ADMIN, Permit.SUPER_ADMIN),
                SetDefaultQuery('status', { $ne: GroupPermissionStatus.DELETED }),
            ).else(SetQuery('status', GroupPermissionStatus.ACTIVE)),
        ],
        create: [
            authenticate('jwt'),
            Permit.or(Permit.SUPER_ADMIN, Permit.ADMIN),
            SetCreatedBy('createdBy'),
            FRequired(['name', 'metaName', 'isAssignable', 'type']),
            CheckUniqueMetaName(),
            discard('status'),
        ],
        update: [disallow()],
        patch: [
            authenticate('jwt'),
            Permit.or(Permit.SUPER_ADMIN, Permit.ADMIN),
            SetCreatedBy('updatedBy'),
            CheckUniqueMetaName(),
        ],
        remove: [authenticate('jwt'), Permit.or(Permit.SUPER_ADMIN, Permit.ADMIN)],
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
