/**
 * Created By Soumya(soumya@smartters.in) on 1/2/2023 at 5:46 PM.
 */
import { UserGroupParticipant_GET, UserGroupParticipantStatus } from '../interfaces/UserGroupParticipantInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { Message_POST, MessageEntityType, MessageType } from '../../message/interfaces/MessageInterface';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';
import { messagePath, userGroupPath, userpath } from '../../../../service_endpoints/services';
import { Service } from 'feathers-mongoose';
import createMessageForOtherGroupParticipants from '../utils/createMessageForOtherGroupParticipants';
import createMessageRecipientsForTheNewParticipant from '../utils/createMessageRecipientsForTheNewParticipant';

/**
 * On participant added create the message of type action.
 * @param result
 * @param context
 * @constructor
 */
const OnUserGroupParticipantCreatedCreateUpdateMessage = async (
    result: UserGroupParticipant_GET,
    context: HookContext,
) => {
    const { app, params, method, data } = context;
    const { group, participant } = result;
    const { user } = params;

    if (method === 'patch') {
        if (!data.status || data.status !== UserGroupParticipantStatus.ACTIVE) return context;
    }

    if (!user) return context;
    if (!params.provider) return context;

    // Define the services.
    const groupService: Service & ServiceAddons<any> = app.service(userGroupPath);
    const userService: Service & ServiceAddons<any> = app.service(userpath);
    const messageService: Service & ServiceAddons<any> = app.service(messagePath);

    // Get user data, participant data and group data.
    const userData = user as User_GET;
    const groupData: UserGroup_GET = 'name' in group ? group : await groupService._get(group.toString());
    const participantData: User_GET =
        'name' in participant ? participant : await userService._get(participant.toString());

    if (groupData.isTeam) return context;

    if (participantData._id.toString() === userData._id.toString()) {
        // Create message for the participant where the user is joined by himself.
        const messageData: Message_POST = {
            type: MessageType.ACTION,
            text: groupData.parentId ? `You joined the channel.` : `You joined the group.`,
            entityType: MessageEntityType.USER_GROUP,
            entityId: groupData._id,
            sender: userData._id,
            recipients: [userData._id],
        };
        await messageService
            .create(messageData, {
                query: {},
                provider: undefined,
                user: userData,
            })
            .catch((e) => {
                // return context;
                return null;
            });

        // Create message for all other participants of the group.
        const messageDataForOtherParticipants: Message_POST = {
            type: MessageType.ACTION,
            text: groupData.parentId
                ? `${participantData.firstName} joined the channel`
                : `${participantData.firstName} joined the group`,
            entityType: MessageEntityType.USER_GROUP,
            entityId: groupData._id,
            sender: userData._id,
        };
        await createMessageForOtherGroupParticipants(app, messageDataForOtherParticipants, groupData, userData, [
            userData._id,
        ]);

        await createMessageRecipientsForTheNewParticipant(app, userData, groupData);
    } else {
        // Create message for the participant.
        const messageData: Message_POST = {
            type: MessageType.ACTION,
            text: `${userData.firstName} added you`,
            entityType: MessageEntityType.USER_GROUP,
            entityId: groupData._id,
            sender: userData._id,
            recipients: [participantData._id],
        };
        await messageService
            .create(messageData, {
                query: {},
                provider: undefined,
                user: userData,
            })
            .catch((e) => {
                // return context;
                return null;
            });

        // Create message for the participant.
        const messageDataForCreator: Message_POST = {
            type: MessageType.ACTION,
            text: `You added ${participantData.firstName}`,
            entityType: MessageEntityType.USER_GROUP,
            entityId: groupData._id,
            sender: userData._id,
            recipients: [userData._id],
        };
        await messageService
            .create(messageDataForCreator, {
                query: {},
                provider: undefined,
                user: userData,
            })
            .catch((e) => {
                // return context;
                return null;
            });

        // Create message for all other participants of the group.
        const messageDataForOtherParticipants: Message_POST = {
            type: MessageType.ACTION,
            text: `${userData.firstName} added ${participantData.firstName}`,
            entityType: MessageEntityType.USER_GROUP,
            entityId: groupData._id,
            sender: userData._id,
        };
        await createMessageForOtherGroupParticipants(app, messageDataForOtherParticipants, groupData, participantData, [
            userData._id,
            participantData._id,
        ]);

        await createMessageRecipientsForTheNewParticipant(app, participantData, groupData);
    }
};

export default OnUserGroupParticipantCreatedCreateUpdateMessage;
