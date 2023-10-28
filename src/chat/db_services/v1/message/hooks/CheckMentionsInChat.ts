/**
 * Created By Soumya(soumya@smartters.in) on 2/23/2023 at 7:47 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Message_POST } from '../interfaces/MessageInterface';
import { userpath } from '../../../../service_endpoints/services';
import { User } from '../../user/user.class';
import { UserStatus } from '../../user/interfaces/UserInterfaces';
import { Types } from 'mongoose';

const CheckMentionsInChat = () => async (context: HookContext) => {
    const { app, data } = context;
    const messageData = data as Message_POST;
    const { text } = messageData;
    if (text) {
        const regex = /@\s*\S+[^\]]+\]\[\w+\]/g;
        const matchedPatterns = text.match(regex);
        // console.log(matchedPatterns);

        messageData.mentionedUsers = [];
        if (matchedPatterns) {
            const userService: User & ServiceAddons<any> = app.service(userpath);
            const checkUserExists = async (userId: string): Promise<boolean> => {
                return await userService
                    ._get(userId, {
                        query: {
                            status: {
                                $ne: UserStatus.REMOVED,
                            },
                        },
                    })
                    .then(() => true)
                    .catch(() => false);
            };
            for (const each of matchedPatterns) {
                const idOfUser = each.substring(each.indexOf('[') + 1, each.length - 1);
                if (await checkUserExists(idOfUser)) {
                    messageData.mentionedUsers.push(new Types.ObjectId(idOfUser));
                }
            }
        }

        if (!messageData.mentionedUsers.length) {
            messageData.mentionedUsers = undefined;
        }

        context.data = messageData;
    }

    return context;
};

export default CheckMentionsInChat;
