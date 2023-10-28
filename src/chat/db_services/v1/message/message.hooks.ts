import * as authentication from '@feathersjs/authentication';
import SetCreatedBy from '../../../hooks/SetCreatedBy';
import FRequired from '../../../hooks/FRequired';
import { disallow, discard, iff, isProvider, keep } from 'feathers-hooks-common';
import ModuleValidateData from '../../../hooks/ModuleValidateData';
import hasDataExists from '../../../utils/hasDataExists';
import { broadcastPath, messagePath, userGroupPath, userpath } from '../../../service_endpoints/services';
import ValidateAttachment from './hooks/ValidateAttachment';
import CreatePersonalChat from './hooks/CreatePersonalChat';
import SetCreatedByQuery from '../../../hooks/SetCreatedByQuery';
import hasData from '../../../utils/hasData';
import SetDefaultItem from '../../../hooks/SetDefaultItem';
import { MessageEntityType, MessageType } from './interfaces/MessageInterface';
import CheckIfUserParticipant from './hooks/CheckIfUserParticipant';
import CheckMentionsInChat from './hooks/CheckMentionsInChat';
import CheckIfGroupHasChannels from './hooks/CheckIfGroupHasChannels';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
    before: {
        all: [authenticate('jwt')],
        find: [iff(isProvider('external'), disallow())],
        get: [iff(isProvider('external'), disallow())],
        create: [
            iff(
                isProvider('external'),
                SetCreatedBy('sender'),
                FRequired('entityType'),
                iff(
                    hasDataExists('entityId'),
                    iff(
                        hasData('entityType', MessageEntityType.USER_GROUP),
                        ModuleValidateData(userGroupPath, 'entityId'),
                        CheckIfGroupHasChannels(),
                    ),
                    iff(
                        hasData('entityType', MessageEntityType.BROADCAST),
                        ModuleValidateData(broadcastPath, 'entityId'),
                    ),
                    CheckIfUserParticipant(),
                ).else(
                    FRequired('recipient'),
                    ModuleValidateData(userpath, 'recipient', { status: 1 }),
                    CreatePersonalChat(),
                ),
                iff(hasDataExists('parentMessage'), ModuleValidateData(messagePath, 'parentMessage')),
                iff(hasDataExists('attachmentType'), ValidateAttachment()).else(FRequired('text')),
                iff(hasDataExists('text')).else(FRequired('attachmentType')),
                discard('status', 'type'),
                SetDefaultItem('type', MessageType.NORMAL_MESSAGE),
                CheckMentionsInChat(),
            ),
        ],
        update: [disallow()],
        patch: [
            // setCreatedByQuery
            iff(isProvider('external'), SetCreatedByQuery('sender'), keep('text')),
        ],
        remove: [
            // setCreatedByQuery
            iff(isProvider('external'), disallow()),
        ],
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
