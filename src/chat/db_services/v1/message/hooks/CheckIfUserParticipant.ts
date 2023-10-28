/**
 * Created By Soumya(soumya@smartters.in) on 1/6/2023 at 2:47 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Message_POST, MessageEntityType } from '../interfaces/MessageInterface';
import { UserGroup_GET, UserGroupType } from '../../user-group/interfaces/UserGroupInterface';
import { BadRequest } from '@feathersjs/errors';
import { Service } from 'feathers-mongoose';
import { userGroupParticipantsPath } from '../../../../service_endpoints/services';
import {
    UserGroupParticipant_FIND,
    UserGroupParticipant_QUERY,
    UserGroupParticipantStatus,
} from '../../user-group-participants/interfaces/UserGroupParticipantInterface';
import { Broadcast_GET } from '../../broadcast/interfaces/BroadCastInterface';

/**
 * Check if user is a participant or recipient for the given group.
 */
const CheckIfUserParticipant = () => async (context: HookContext) => {
    const { data, app } = context;

    const { sender, entityIdData, entityType } = data as Message_POST;

    if (entityIdData && entityType === MessageEntityType.USER_GROUP) {
        const groupData = entityIdData as UserGroup_GET;
        if (groupData.type === UserGroupType.PERSONAL_CHAT) {
            const { firstUser, secondUser } = groupData;
            if (firstUser && secondUser) {
                if (sender.toString() !== firstUser.toString() && sender.toString() !== secondUser.toString()) {
                    throw new BadRequest('You can not chat with this person.');
                }
            }
        } else {
            const userGroupParticipantService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);
            const participantQuery: UserGroupParticipant_QUERY = {
                status: UserGroupParticipantStatus.ACTIVE,
                group: groupData._id,
                participant: sender,
            };
            const participantData = await userGroupParticipantService
                ._find({
                    query: {
                        ...participantQuery,
                        $limit: 1,
                    },
                })
                .then((res: UserGroupParticipant_FIND) => (res.total ? res.data[0] : null));
            if (!participantData) {
                throw new BadRequest('You can not chat in this group.');
            }
        }
    } else if (entityIdData && entityType === MessageEntityType.BROADCAST) {
        const broadcastData = entityIdData as Broadcast_GET;
        if (broadcastData.createdBy.toString() !== sender.toString()) {
            throw new BadRequest('You can not send message on this broadcast.');
        }
    }
};

export default CheckIfUserParticipant;
