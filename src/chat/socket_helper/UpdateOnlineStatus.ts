/**
 * Created By Soumya(soumya@smartters.in) on 1/4/2023 at 3:34 PM.
 */
import { User_GET, User_PATCH, UserOnlineStatus, UserRole } from '../db_services/v1/user/interfaces/UserInterfaces';
import { Application } from '../declarations';
import { Service } from 'feathers-mongoose';
import { ServiceAddons } from '@feathersjs/feathers';
import {personalChatDetailsCustomPath, userGroupPath, userpath} from '../service_endpoints/services';
import {
    UserGroup_GET,
    UserGroupStatus,
    UserGroupType,
} from '../db_services/v1/user-group/interfaces/UserGroupInterface';
import { LastSeenPublishResponse } from '../services/v1/chat/personal-chat/details/interfaces/LastSeenPublishResponse';
import { Types } from 'mongoose';
import {User} from "../db_services/v1/user/user.class";

/**
 * Enum value for socket actions
 */
export enum SocketActions {
    LOGIN = 'login',
    DISCONNECT = 'disconnect',
}

/**
 * Update online status and last seen of the user.
 * @param userData
 * @param app
 * @param action
 * @constructor
 */
const UpdateOnlineStatus = async (userData: User_GET, app: Application, action: SocketActions) => {
    if (userData.role === UserRole.USER) {
        const newUserData: User_PATCH = {
            online: {
                ...userData.online,
                status: action === SocketActions.LOGIN ? UserOnlineStatus.ONLINE : UserOnlineStatus.OFFLINE,
                lastSeen: action === SocketActions.LOGIN ? undefined : new Date(),
            },
        };
        const userService: User & ServiceAddons<any> = app.service(userpath);
        await userService._patch(userData._id.toString(), {
            ...newUserData,
        });

        const userGroupService: Service & ServiceAddons<any> = app.service(userGroupPath);
        const personalChatsOfUser: Array<UserGroup_GET> = await userGroupService._find({
            query: {
                $or: [{ firstUser: userData._id }, { secondUser: userData._id }],
                status: {
                    $ne: UserGroupStatus.DELETED,
                },
                $select: ['_id', 'firstUser', 'secondUser'],
                type: UserGroupType.PERSONAL_CHAT,
            },
            paginate: false,
        });

        const data: Array<LastSeenPublishResponse | undefined> = personalChatsOfUser
            .map((e) => {
                if (e.firstUser && e.secondUser && newUserData.online) {
                    return {
                        group: e._id,
                        sender: userData._id,
                        online: newUserData.online,
                        user:
                            e.firstUser.toString() === userData._id.toString()
                                ? (e.secondUser as Types.ObjectId)
                                : (e.firstUser as Types.ObjectId),
                    };
                }
            })
            .filter((e) => typeof e !== 'undefined');
        const personalChatCustomService = app.service(personalChatDetailsCustomPath);
        await personalChatCustomService.update(null, data, {
            provider: undefined,
        });
    }
};

export default UpdateOnlineStatus;
