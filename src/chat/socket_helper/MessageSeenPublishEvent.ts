/**
 * Created By Soumya(soumya@smartters.in) on 1/9/2023 at 3:36 PM.
 */
import { Message_GET, Message_PATCH, MessageStatus } from '../db_services/v1/message/interfaces/MessageInterface';
import { HookContext } from '@feathersjs/feathers';
import { User_GET } from '../db_services/v1/user/interfaces/UserInterfaces';
import { UserGroup_GET, UserGroupType } from '../db_services/v1/user-group/interfaces/UserGroupInterface';

/**
 * Socket handler for message seen event.
 * @param result
 * @param context
 * @constructor
 */
const MessageSeenPublishEvent = (result: Message_GET, context: HookContext) => {
    const { app } = context;
    const { status } = context.data as Message_PATCH;
    if (status && status === MessageStatus.SEEN) {
        const { sender, _id, entityId } = result;
        const userData = sender as User_GET;
        const groupData = entityId as UserGroup_GET;

        let recipientId: string | undefined = undefined;
        if (groupData.type === UserGroupType.PERSONAL_CHAT) {
            if (groupData.firstUser && groupData.secondUser) {
                recipientId =
                    groupData.firstUser.toString() === userData._id.toString()
                        ? groupData.secondUser.toString()
                        : groupData.firstUser.toString();
            }
        }

        const response: any = {
            _id,
            sender: {
                _id: userData._id,
            },
            group: entityId._id,
        };

        if (recipientId) {
            response.recipient = recipientId;
        }

        context.result = response;

        const userId = sender?._id ? sender?._id : sender;
        return [app.channel(`userIds/${userId.toString()}`)];
        // return app.channel('authenticated').filter((connection) => {
        //     return userData._id.toString() === connection.user._id.toString();
        // });
    }
};

export default MessageSeenPublishEvent;
