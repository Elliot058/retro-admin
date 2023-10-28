/**
 * Created By Soumya(soumya@smartters.in) on 1/3/2023 at 9:07 PM.
 */
import {
    MessageRecipient_FIND,
    MessageRecipient_GET,
    MessageRecipientEntityType,
    MessageRecipientStatus,
} from '../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { UserGroup_GET, UserGroupType } from '../db_services/v1/user-group/interfaces/UserGroupInterface';
import { Message_GET } from '../db_services/v1/message/interfaces/MessageInterface';
import { User_GET } from '../db_services/v1/user/interfaces/UserInterfaces';
import { messageRecipientsPath } from '../service_endpoints/services';
import { Service } from 'feathers-mongoose';

const MessageRecipientPublishEvent = async (result: MessageRecipient_GET, context: HookContext) => {
    const { data, method } = context;
    if (method === 'patch' && data.status && data.status === MessageRecipientStatus.SEEN) return;
    const { user, entityId, entityType, message, status } = result;

    if (entityType !== MessageRecipientEntityType.GROUP) return;

    const { app } = context;

    const groupData = entityId as UserGroup_GET;
    const messageData = message as Message_GET;
    const senderData = messageData.sender as User_GET;
    const parentMessageData = messageData.parentMessage ? (messageData.parentMessage as Message_GET) : null;
    const parentMessageSenderData = parentMessageData?.sender ? (parentMessageData?.sender as User_GET) : null;

    const firstUserData = groupData?.firstUser ? (groupData.firstUser as User_GET) : null;
    const secondUserData = groupData?.secondUser ? (groupData.secondUser as User_GET) : null;

    const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
    const unseenMessageCount = await messageRecipientService
        ._find({
            query: {
                status: MessageRecipientStatus.SENT,
                user: user,
                entityType: MessageRecipientEntityType.GROUP,
                entityId: entityId,
                $limit: 0,
            },
        })
        .then((res: MessageRecipient_FIND) => res.total);

    context.result = {
        unseenCount: unseenMessageCount,
        status,
        message: {
            _id: messageData._id,
            text: messageData.text,
            type: messageData.type,
            attachment: messageData.attachment,
            createdAt: messageData.createdAt,
            updatedAt: messageData.updatedAt,
            status: messageData.status,
            sender: {
                name: senderData.firstName + ' ' + senderData.lastName,
                phone: senderData.phone,
                avatar: senderData.avatar,
                _id: senderData._id,
            },
            parentMessage: parentMessageData
                ? {
                      _id: parentMessageData._id,
                      text: parentMessageData.text,
                      attachment: parentMessageData.attachment,
                      createdAt: parentMessageData.createdAt,
                      updatedAt: parentMessageData.updatedAt,
                      type: parentMessageData.type,
                      sender: {
                          name: parentMessageSenderData?.firstName + ' ' + parentMessageSenderData?.lastName,
                          phone: parentMessageSenderData?.phone,
                          avatar: parentMessageSenderData?.avatar,
                          _id: parentMessageSenderData?._id,
                      },
                  }
                : undefined,
        },
        group: {
            _id: groupData._id,
            type: groupData.type,
            name:
                groupData.type === UserGroupType.PERSONAL_CHAT
                    ? user.toString() === firstUserData?._id.toString()
                        ? secondUserData?.firstName + ' ' + secondUserData?.lastName
                        : firstUserData?.firstName + ' ' + secondUserData?.lastName
                    : groupData.name,
            avatar:
                groupData.type === UserGroupType.PERSONAL_CHAT
                    ? user.toString() === firstUserData?._id.toString()
                        ? secondUserData?.avatar
                        : firstUserData?.avatar
                    : groupData.avatar,
            online: groupData.type === UserGroupType.PERSONAL_CHAT ? senderData.online : undefined,
            memberCount: groupData.type !== UserGroupType.PERSONAL_CHAT ? groupData.memberCount : undefined,
            isTeam: groupData.type !== UserGroupType.PERSONAL_CHAT ? groupData.isTeam || false : null,
            parentData:
                groupData.parentId && 'name' in groupData.parentId
                    ? {
                          _id: groupData.parentId._id,
                          name: groupData.parentId.name,
                          avatar: groupData.parentId.avatar,
                          memberCount: groupData.parentId.memberCount,
                          type: groupData.parentId.type,
                          isTeam: groupData.parentId.isTeam || false,
                      }
                    : undefined,
        },
    };

    // console.log(context.result);
    return [app.channel(`userIds/${user.toString()}`)];

    // return app.channel('authenticated').filter((connection) => {
    //     return user.toString() === connection.user._id.toString();
    // });
};

export default MessageRecipientPublishEvent;
