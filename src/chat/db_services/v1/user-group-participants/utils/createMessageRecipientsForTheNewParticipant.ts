/**
 * Created By Soumya(soumya@smartters.in) on 1/6/2023 at 2:11 PM.
 */
import { Application, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { messagePath, messageRecipientsPath } from '../../../../service_endpoints/services';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';
import {
    Message_FIND,
    Message_GET,
    Message_Query,
    MessageStatus,
    MessageType,
} from '../../message/interfaces/MessageInterface';
import {
    MessageRecipient_POST,
    MessageRecipientEntityType,
} from '../../message-recipients/interfaces/MessageRecipientsInterface';

/**
 * Create message recipients for the new participant joined in the group.
 * @param app
 * @param userData
 * @param groupData
 */
const createMessageRecipientsForTheNewParticipant = async (
    app: Application,
    userData: User_GET,
    groupData: UserGroup_GET,
) => {
    const messageService: Service & ServiceAddons<any> = app.service(messagePath);
    const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);

    const createdMessage = await messageService
        ._find({
            query: {
                entityId: groupData._id,
                status: MessageStatus.ACTIVE,
                $sort: { createdAt: 1 },
                $limit: 2,
            },
        })
        .then((res: Message_FIND) => (res.total === 2 ? res.data[1] : null));

    if (createdMessage) {
        const messageRecipientData: MessageRecipient_POST = {
            message: createdMessage._id,
            entityId: groupData._id,
            user: userData._id,
            entityType: MessageRecipientEntityType.GROUP,
        };
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

    let canFetchPreviousMessages = true;
    if (groupData.settings) {
        canFetchPreviousMessages = !groupData.settings.hideChatForNewMember;
    }

    if (canFetchPreviousMessages) {
        const allMessageQuery: Message_Query = {
            status: MessageStatus.ACTIVE,
            type: MessageType.NORMAL_MESSAGE,
            entityId: groupData._id,
            $select: ['_id'],
            $sort: { createdAt: 1 },
        };
        const allMessagesOfGroup = await messageService
            ._find({
                query: allMessageQuery,
                paginate: false,
            })
            .then((res: Array<Message_GET>) => res.map((e) => e._id));

        const messageRecipientData: Array<MessageRecipient_POST> = allMessagesOfGroup.map((e) => {
            return {
                message: e,
                user: userData._id,
                entityType: MessageRecipientEntityType.GROUP,
                entityId: groupData._id,
            };
        });
        if (messageRecipientData.length) {
            await messageRecipientService._create(messageRecipientData);
        }
    }
};

export default createMessageRecipientsForTheNewParticipant;
