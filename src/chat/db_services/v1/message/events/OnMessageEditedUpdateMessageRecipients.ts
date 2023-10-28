/**
 * Created By Soumya(soumya@smartters.in) on 12/30/2022 at 5:10 PM.
 */
import {
    Message_GET,
    Message_PATCH,
    Message_POST,
    MessageEntityType,
    MessageStatus,
} from '../interfaces/MessageInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { messageRecipientsPath, userGroupPath } from '../../../../service_endpoints/services';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';
import { Service } from 'feathers-mongoose';

/**
 * On Message created create message recipients for all the recipients.
 * @param result
 * @param context
 * @constructor
 */
const OnMessageEditedUpdateMessageRecipients = async (result: Message_GET, context: HookContext) => {
    const { app, method } = context;

    if (method === 'patch') {
        const { status } = context.data as Message_PATCH;
        if (status && status === MessageStatus.SEEN) return context;
    }

    const { entityIdData } = context.data as Message_POST;
    const { entityId, entityType } = result;

    if (entityType === MessageEntityType.USER_GROUP) {
        // Get the user group data.
        const userGroupData = !entityIdData
            ? ((await app.service(userGroupPath)._get(entityId)) as UserGroup_GET)
            : entityIdData;

        const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
        await messageRecipientService.patch(
            null,
            {
                group: userGroupData._id,
            },
            {
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
                            ],
                        },
                    ],
                },
            },
        );
    }
};

export default OnMessageEditedUpdateMessageRecipients;
