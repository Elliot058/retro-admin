import * as authentication from '@feathersjs/authentication';
import { disallow, iff, isProvider } from 'feathers-hooks-common';
import LeaveGroup from './hooks/LeaveGroup';
import FRequired from '../../../../../hooks/FRequired';
import ModuleValidateData from '../../../../../hooks/ModuleValidateData';
import { userGroupPath } from '../../../../../service_endpoints/services';
import SetCreatedBy from '../../../../../hooks/SetCreatedBy';
import CheckParticipants from '../participants/hooks/CheckParticipants';
import JoinGroup from './hooks/JoinGroup';
import GetUserDataAndParticipants from '../participants/hooks/GetUserDataAndParticipants';
import GetJoinRequests from './hooks/GetJoinRequests';
import CheckIfJoiningChannel from "./hooks/CheckIfJoiningChannel";
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [GetJoinRequests()],
        get: [disallow()],
        create: [
            FRequired(['group']),
            ModuleValidateData(userGroupPath, 'group'),
            SetCreatedBy('createdBy'),
            JoinGroup(),
            CheckIfJoiningChannel(),
            GetUserDataAndParticipants(),
            CheckParticipants(),
        ],
        update: [iff(isProvider('external'), disallow())],
        patch: [disallow()],
        remove: [LeaveGroup()],
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
