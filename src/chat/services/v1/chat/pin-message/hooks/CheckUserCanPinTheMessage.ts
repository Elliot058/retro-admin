/**
 * Created By Soumya(soumya@smartters.in) on 2/22/2023 at 4:38 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { MessagePinned_POST } from '../../../../../db_services/v1/message-pinned/interfaces/MessagePinnedInterface';
import { MessageRecipients } from '../../../../../db_services/v1/message-recipients/message-recipients.class';
import { messageRecipientsPath, userGroupParticipantsPath } from '../../../../../service_endpoints/services';
import {
    MessageRecipient_FIND,
    MessageRecipient_QUERY,
    MessageRecipientStatus,
} from '../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { BadRequest } from '@feathersjs/errors';
import { UserGroup_GET, UserGroupType } from '../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import { UserGroupParticipants } from '../../../../../db_services/v1/user-group-participants/user-group-participants.class';
import {
    UserGroupParticipant_FIND,
    UserGroupParticipant_QUERY,
    UserGroupParticipantStatus,
} from '../../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import { MessageEntityType } from '../../../../../db_services/v1/message/interfaces/MessageInterface';

const CheckUserCanPinTheMessage = () => async (context: HookContext) => {
    const { app, data } = context;
    const pinMessageData = data as MessagePinned_POST;
    const { createdBy, message } = pinMessageData;

    const messageRecipientService: MessageRecipients & ServiceAddons<any> = app.service(messageRecipientsPath);
    const messageRecipientQuery: MessageRecipient_QUERY = {
        message,
        user: createdBy,
        status: { $ne: MessageRecipientStatus.DELETED },
    };
    const messageRecipientData = await messageRecipientService
        ._find({
            query: {
                ...messageRecipientQuery,
                $limit: 1,
                $populate: ['entityId'],
            },
        })
        .then((res: MessageRecipient_FIND) => (res.total ? res.data[0] : null));
    if (!messageRecipientData) {
        throw new BadRequest('You can not pin this message.');
    } else {
        const { entityId } = messageRecipientData;
        const { type, firstUser, secondUser } = entityId as UserGroup_GET;
        if (type === UserGroupType.PERSONAL_CHAT && firstUser && secondUser) {
            if (createdBy.toString() !== firstUser.toString() && createdBy.toString() !== secondUser.toString()) {
                throw new BadRequest('You can not pin the message with this chat.');
            }
        } else {
            const userGroupParticipantService: UserGroupParticipants & ServiceAddons<any> =
                app.service(userGroupParticipantsPath);
            const userGroupParticipantQuery: UserGroupParticipant_QUERY = {
                group: entityId._id,
                participant: createdBy,
                status: UserGroupParticipantStatus.ACTIVE,
            };
            const userGroupParticipantDataExists = await userGroupParticipantService
                ._find({
                    query: {
                        ...userGroupParticipantQuery,
                        $limit: 0,
                    },
                })
                .then((res: UserGroupParticipant_FIND) => res.total);
            if (!userGroupParticipantDataExists) {
                throw new BadRequest('You are not permitted to pin this message.');
            }
        }

        pinMessageData.entityType =
            messageRecipientData.entityType === 'userGroup'
                ? MessageEntityType.USER_GROUP
                : MessageEntityType.BROADCAST;
        pinMessageData.entityId = messageRecipientData.entityId._id;

        context.data = pinMessageData;
    }

    return context;
};

export default CheckUserCanPinTheMessage;
