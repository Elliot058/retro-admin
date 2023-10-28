// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import search from 'feathers-mongodb-fuzzy-search';
import * as authentication from '@feathersjs/authentication';
import { disallow, iff } from 'feathers-hooks-common';
import isUser from '../../../utils/isUser';
import SetCreatedByQuery from '../../../hooks/SetCreatedByQuery';
import SetDefaultQuery from '../../../hooks/SetDefaultQuery';
import { BroadCastStatus } from '../../../db_services/v1/broadcast/interfaces/BroadCastInterface';
import PatchDeleted from '../../../hooks/PatchDeleted';
import SetCreatedBy from '../../../hooks/SetCreatedBy';
import FRequired from '../../../hooks/FRequired';
import ModuleValidateData from '../../../hooks/ModuleValidateData';
import { userGroupPath } from '../../../service_endpoints/services';
import { UserGroupStatus } from '../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import GetAllBroadcastsForUser from './hooks/GetAllBroadcastsForUser';
import CheckIfUserParticipantOfGroups from './hooks/CheckIfUserParticipantOfGroups';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [
            SetDefaultQuery('status', BroadCastStatus.ACTIVE),
            iff(isUser('user'), SetCreatedByQuery('createdBy'), GetAllBroadcastsForUser()),
            search({
                fields: ['name'],
            }),
        ],
        get: [
            SetDefaultQuery('status', BroadCastStatus.ACTIVE),
            iff(isUser('user'), SetCreatedByQuery('createdBy'), GetAllBroadcastsForUser()),
        ],
        create: [
            SetCreatedBy('createdBy'),
            FRequired(['name', 'groups']),
            ModuleValidateData(userGroupPath, 'groups', { status: UserGroupStatus.ACTIVE }),
            iff(isUser('user'), CheckIfUserParticipantOfGroups()),
        ],
        update: [disallow()],
        patch: [SetCreatedBy('updatedBy'), iff(isUser('user'), SetCreatedByQuery('createdBy'))],
        remove: [iff(isUser('user'), SetCreatedByQuery('createdBy'))],
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
