/**
 * Created By Soumya(soumya@smartters.in) on 12/30/2022 at 5:10 PM.
 */
import { Message_GET, Message_POST, MessageEntityType } from '../interfaces/MessageInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import {
    messageRecipientsPath,
    userGroupParticipantsPath,
    userGroupPath,
} from '../../../../service_endpoints/services';
import { UserGroup_GET, UserGroupType } from '../../user-group/interfaces/UserGroupInterface';
import { Types } from 'mongoose';
import {
    UserGroupParticipant_GET,
    UserGroupParticipant_QUERY,
    UserGroupParticipantStatus,
} from '../../user-group-participants/interfaces/UserGroupParticipantInterface';
import {
    MessageRecipient_POST,
    MessageRecipientEntityType,
    MessageRecipientStatus,
} from '../../message-recipients/interfaces/MessageRecipientsInterface';
import { Service } from 'feathers-mongoose';

/**
 * On Message created create message recipients for all the recipients.
 * @param result
 * @param context
 * @constructor
 */
const OnMessageCreatedCreateMessageRecipients = async (result: Message_GET, context: HookContext) => {
    const { app } = context;
    const { entityIdData, recipients: messageRecipients } = context.data as Message_POST;
    const { entityId, entityType, sender } = result;

    const senderId = sender?._id ? sender?._id : sender;

    if (entityType === MessageEntityType.USER_GROUP) {
        // Get the user group data.
        const userGroupData = !entityIdData
            ? ((await app.service(userGroupPath)._get(entityId)) as UserGroup_GET)
            : (entityIdData as UserGroup_GET);

        // Create a recipient array.
        let recipients: Array<Types.ObjectId> = messageRecipients || [];

        if (!recipients.length) {
            if (userGroupData.type === UserGroupType.PERSONAL_CHAT) {
                // If it is a personal chat add the firstUser and secondUser to recipients.
                recipients.push(
                    userGroupData?.firstUser as Types.ObjectId,
                    userGroupData?.secondUser as Types.ObjectId,
                );
            } else {
                // If it is not a personal chat get all the participants for the group and add them to recipients.
                const participantQuery: UserGroupParticipant_QUERY = {
                    status: UserGroupParticipantStatus.ACTIVE,
                    group: userGroupData._id,
                };
                const participants: Array<Types.ObjectId> = await app
                    .service(userGroupParticipantsPath)
                    ._find({
                        query: {
                            ...participantQuery,
                            $select: ['participant'],
                        },
                        paginate: false,
                    })
                    .then((res: Array<UserGroupParticipant_GET>) => res.map((e) => e.participant));

                recipients = recipients.concat(participants);
            }
        }

        // Create the message recipients for the specified message.
        const messageRecipientData: Array<MessageRecipient_POST> = recipients.map((e) => {
            return {
                message: result._id,
                entityType: MessageRecipientEntityType.GROUP,
                entityId: userGroupData._id,
                user: e,
                status:
                    e.toString() === senderId.toString() ? MessageRecipientStatus.SEEN : MessageRecipientStatus.SENT,
            };
        });

        const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
        await messageRecipientService.create(messageRecipientData, {
            query: {
                $populate: [
                    {
                        path: 'message',
                        populate: [
                            {
                                path: 'sender',
                            },
                            {
                                path: 'parentMessage',
                                populate: [
                                    {
                                        path: 'sender',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        path: 'entityId',
                        populate: [
                            {
                                path: 'firstUser',
                            },
                            {
                                path: 'secondUser',
                            },
                            {
                                path: 'parentId',
                            },
                        ],
                    },
                ],
            },
        });
    }
};

export default OnMessageCreatedCreateMessageRecipients;
