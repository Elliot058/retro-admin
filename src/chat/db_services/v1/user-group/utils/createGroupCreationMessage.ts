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

const createGroupCreationMessage = async (
    app: Application,
    groupData: UserGroup_GET,
    userData: User_GET,
    otherParticipants: Array<Types.ObjectId>,
) => {
    const messageService: Service & ServiceAddons<any> = app.service(messagePath);
    const messageData: Message_POST = {
        type: MessageType.ACTION,
        text: groupData.parentId
            ? `You created the channel ${groupData.name}`
            : `You created the group ${groupData.name}`,
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

    const messageDataForOtherUsers: Message_POST = {
        type: MessageType.ACTION,
        text: groupData.parentId
            ? `${userData.firstName} created the channel ${groupData.name}`
            : `${userData.firstName} created the group ${groupData.name}`,
        entityType: MessageEntityType.USER_GROUP,
        entityId: groupData._id,
        sender: userData._id,
        recipients: otherParticipants,
    };
    if (otherParticipants.length) {
        await messageService
            .create(messageDataForOtherUsers, {
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

export default createGroupCreationMessage;
