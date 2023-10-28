import * as authentication from '@feathersjs/authentication';
import { disallow, discard, iff } from 'feathers-hooks-common';
import FRequired from '../../../../../hooks/FRequired';
import ModuleValidateData from '../../../../../hooks/ModuleValidateData';
import { broadcastPath, userGroupPath } from '../../../../../service_endpoints/services';
import { BroadCastStatus } from '../../../../../db_services/v1/broadcast/interfaces/BroadCastInterface';
import isUser from '../../../../../utils/isUser';
import CheckBroadcastAccessCreator from './hooks/CheckBroadcastAccessCreator';
import CheckGroupsAlreadyExistOrNot from './hooks/CheckGroupsAlreadyExistOrNot';
import GetBroadcastFromBroadcastAccess from './hooks/GetBroadcastFromBroadcastAccess';
import SetDefaultItem from '../../../../../hooks/SetDefaultItem';
import { BroadcastAccessStatus } from '../../../../../db_services/v1/broadcast-access/interfaces/BroadcastAccessInterface';
import { UserGroupStatus } from '../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import CheckIfUserParticipantOfGroups from '../../../broadcast-management/hooks/CheckIfUserParticipantOfGroups';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [disallow()],
        get: [disallow()],
        create: [
            FRequired(['broadcast', 'groups']),
            ModuleValidateData(broadcastPath, 'broadcast', { status: BroadCastStatus.ACTIVE }),
            ModuleValidateData(userGroupPath, 'groups', { status: UserGroupStatus.ACTIVE }),
            iff(isUser('user'), CheckBroadcastAccessCreator(), CheckIfUserParticipantOfGroups()),
            CheckGroupsAlreadyExistOrNot(),
        ],
        update: [disallow()],
        patch: [
            GetBroadcastFromBroadcastAccess(),
            iff(isUser('user'), CheckBroadcastAccessCreator()),
            discard('status'),
            SetDefaultItem('status', BroadcastAccessStatus.DELETED),
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
