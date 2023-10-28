/**
 * Created By Soumya(soumya@smartters.in) on 1/2/2023 at 5:33 PM.
 */
import { UserGroup_GET, UserGroup_PATCH, UserGroupType } from '../interfaces/UserGroupInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { messagePath, userpath } from '../../../../service_endpoints/services';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { Message_POST, MessageEntityType, MessageType } from '../../message/interfaces/MessageInterface';

/**
 * On update of group details creat a message of type action.
 * @param result
 * @param context
 * @constructor
 */
const OnUserGroupEditedCreateUpdateMessage = async (result: UserGroup_GET, context: HookContext) => {
    const { app } = context;
    const data = context.data as UserGroup_PATCH;
    const { type, parentId, isTeam } = result;

    if (isTeam) return context;

    // Define services.
    const userService: Service & ServiceAddons<any> = app.service(userpath);
    const messageService: Service & ServiceAddons<any> = app.service(messagePath);

    // If the chat type not personal chat then only create message.
    if (type !== UserGroupType.PERSONAL_CHAT) {
        const { avatar, description, name, updatedBy } = data;

        // Define the user that has updated the data.
        if (!updatedBy) return context;
        const updatedByData: User_GET = await userService._get(updatedBy.toString());

        // Define the text.
        let text = '';
        if (name) {
            text = `${updatedByData.firstName} changed the ${parentId ? 'channel' : 'group'} name.`;
        } else if (avatar) {
            text = `${updatedByData.firstName} changed the ${parentId ? 'channel' : 'group'} profile picture.`;
        } else if (description) {
            text = `${updatedByData.firstName} changed the ${parentId ? 'channel' : 'group'} description.`;
        }

        // the message object for creating a message.
        const messageData: Message_POST = {
            type: MessageType.ACTION,
            text,
            sender: updatedByData._id,
            entityId: result._id,
            entityType: MessageEntityType.USER_GROUP,
        };

        // Create the message.
        await messageService.create(messageData, {
            query: {},
            provider: undefined,
            user: updatedByData,
        });
    }
};

export default OnUserGroupEditedCreateUpdateMessage;
