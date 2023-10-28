/**
 * Created By Soumya(soumya@smartters.in) on 2/22/2023 at 4:38 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import {
    MessagePinned_GET,
} from '../../../../../db_services/v1/message-pinned/interfaces/MessagePinnedInterface';
import { MessageRecipients } from '../../../../../db_services/v1/message-recipients/message-recipients.class';
import {
    messagePinnedPath,
    messageRecipientsPath,
    userGroupParticipantsPath,
} from '../../../../../service_endpoints/services';
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
import { MessagePinned } from '../../../../../db_services/v1/message-pinned/message-pinned.class';

const CheckUserCanUnPinTheMessage = () => async (context: HookContext) => {
    const { app, id, params } = context;

    const { user: userData } = params;
    if (!userData) return context;

    if (!id) throw new BadRequest('Invalid operation.');

    const pinMessageService: MessagePinned & ServiceAddons<any> = app.service(messagePinnedPath);
    const pinMessageData = await pinMessageService
        ._get(id, {
            query: {
                status: 1,
            },
        })
        .then((res: MessagePinned_GET) => res)
        .catch(() => {
            throw new BadRequest('Invalid pin message given.');
        });
    const { message, user } = pinMessageData;

    if (user && userData._id.toString() !== user.toString()) {
        throw new BadRequest('You can not unpin this message.');
    } else {
        const messageRecipientService: MessageRecipients & ServiceAddons<any> = app.service(messageRecipientsPath);
        const messageRecipientQuery: MessageRecipient_QUERY = {
            message,
            user: userData._id,
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
            throw new BadRequest('You can not unpin this message.');
        } else {
            const { entityId } = messageRecipientData;
            const { type, firstUser, secondUser } = entityId as UserGroup_GET;
            if (type === UserGroupType.PERSONAL_CHAT && firstUser && secondUser) {
                if (
                    userData._id.toString() !== firstUser.toString() &&
                    userData._id.toString() !== secondUser.toString()
                ) {
                    throw new BadRequest('You can not unpin the message with this chat.');
                }
            } else {
                const userGroupParticipantService: UserGroupParticipants & ServiceAddons<any> =
                    app.service(userGroupParticipantsPath);
                const userGroupParticipantQuery: UserGroupParticipant_QUERY = {
                    group: entityId._id,
                    participant: userData._id,
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
                    throw new BadRequest('You are not permitted to unpin this message.');
                }
            }
        }
    }

    return context;
};

export default CheckUserCanUnPinTheMessage;
