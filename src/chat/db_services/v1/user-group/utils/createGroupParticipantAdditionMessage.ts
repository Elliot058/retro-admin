import { Message_POST, MessageEntityType, MessageType } from '../../message/interfaces/MessageInterface';
import { Service } from 'feathers-mongoose';
import { Application, ServiceAddons } from '@feathersjs/feathers';
import { messagePath } from '../../../../service_endpoints/services';
import { UserGroup_GET } from '../interfaces/UserGroupInterface';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { Types } from 'mongoose';

/**
 * Created By Soumya(soumya@smartters.in) on 1/6/2023 at 10:49 AM.
 */

const createGroupParticipantAdditionMessage = async (
    app: Application,
    groupData: UserGroup_GET,
    userData: User_GET,
    participantData: User_GET,
    otherParticipants: Array<Types.ObjectId>,
) => {
    const messageService: Service & ServiceAddons<any> = app.service(messagePath);
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

    // Create message for the creator.
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
        recipients: otherParticipants,
    };
    if (otherParticipants.length) {
        await messageService
            .create(messageDataForOtherParticipants, {
                query: {},
                provider: undefined,
                user: userData,
            })
            .catch((e) => {
                // return context;
                return null;
            });
    }
};

export default createGroupParticipantAdditionMessage;
