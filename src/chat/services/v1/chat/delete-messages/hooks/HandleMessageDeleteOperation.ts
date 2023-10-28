/**
 * Created By Soumya(soumya@smartters.in) on 1/3/2023 at 6:32 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import {
    MessageDelete_Post,
    MessageDeleteType,
} from '../../../../../db_services/v1/message/interfaces/MessageInterface';
import { BadRequest } from '@feathersjs/errors';
import {
    MessageRecipient_QUERY,
    MessageRecipientStatus,
} from '../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { Types } from 'mongoose';
import { User_GET } from '../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { messageRecipientsPath, userGroupPath } from '../../../../../service_endpoints/services';
import {
    UserGroup_GET,
    UserGroupStatus,
    UserGroupType,
} from '../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import deleteMessageForGroupChat from '../utils/deleteMessageForGroupChat';
import { deleteMessageRecipients } from '../utils/deleteMessageRecipients';

/**
 * Handle the delete of message i.e. delete only for me or delete for everyone.
 * @constructor
 */
const HandleMessageDeleteOperation = () => async (context: HookContext) => {
    const { app, params, data } = context;
    const { user } = params;

    const messageDeleteData = data as MessageDelete_Post;

    const { messages, group, deleteType } = messageDeleteData;
    if (!group) return context;

    // Define the query for message recipient.
    let messageRecipientQuery: MessageRecipient_QUERY = {
        status: { $ne: MessageRecipientStatus.DELETED },
        entityId: messages ? { $ne: null } : new Types.ObjectId(group),
    };
    if (messages) {
        messageRecipientQuery.message = {
            $in: messages.map((e) => new Types.ObjectId(e)),
        };
    }

    if (deleteType === MessageDeleteType.FOR_ME) {
        // If deleteType is for me then attach the user query.
        messageRecipientQuery = {
            ...messageRecipientQuery,
            user: (user as User_GET)._id,
        };

        await deleteMessageRecipients(messageRecipientQuery, app);
    } else if (deleteType === MessageDeleteType.FOR_EVERYONE) {
        // Nothing to be done.
        const groupService: Service & ServiceAddons<any> = app.service(userGroupPath);
        const groupType = await groupService
            ._get(group, {
                query: {
                    status: UserGroupStatus.ACTIVE,
                },
            })
            .then((res: UserGroup_GET) => res.type);

        if (groupType !== UserGroupType.PERSONAL_CHAT) {
            await deleteMessageForGroupChat(app, messages ? messages : [], user as User_GET, group);
        } else {
            await deleteMessageRecipients(messageRecipientQuery, app);
        }
    } else {
        throw new BadRequest('Invalid message delete operation.');
    }

    context.result = {
        message: 'This message is deleted.',
    };
};

export default HandleMessageDeleteOperation;
