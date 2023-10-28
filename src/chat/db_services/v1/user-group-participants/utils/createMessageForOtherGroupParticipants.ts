/**
 * Created By Soumya(soumya@smartters.in) on 1/2/2023 at 6:34 PM.
 */
import { Application, ServiceAddons } from '@feathersjs/feathers';
import {
    UserGroupParticipant_GET,
    UserGroupParticipant_QUERY,
    UserGroupParticipantStatus,
} from '../interfaces/UserGroupParticipantInterface';
import { Types } from 'mongoose';
import { Service } from 'feathers-mongoose';
import { messagePath, userGroupParticipantsPath } from '../../../../service_endpoints/services';
import { Message_POST } from '../../message/interfaces/MessageInterface';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';
import { User_GET } from '../../user/interfaces/UserInterfaces';

/**
 * Create message for group participants.
 * @param app
 * @param messageData
 * @param groupData
 * @param userData
 * @param excludedUsers
 */
const createMessageForOtherGroupParticipants = async (
    app: Application,
    messageData: Message_POST,
    groupData: UserGroup_GET,
    userData: User_GET,
    excludedUsers: Array<Types.ObjectId>,
) => {
    const groupParticipantService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);
    const messageService: Service & ServiceAddons<any> = app.service(messagePath);

    const participantQuery: UserGroupParticipant_QUERY = {
        status: UserGroupParticipantStatus.ACTIVE,
        group: groupData._id,
        participant: {
            $nin: excludedUsers,
        },
    };
    const participants: Array<Types.ObjectId> = await groupParticipantService
        ._find({
            query: {
                ...participantQuery,
                $select: ['participant'],
            },
            paginate: false,
        })
        .then((res: Array<UserGroupParticipant_GET>) => res.map((e) => e.participant as Types.ObjectId));

    // const otherUsers = excludedUsers.map((e) => e.toString());
    // participants = participants
    //     .map((e) => e.toString())
    //     .filter((e) => !otherUsers.includes(e))
    //     .map((e) => new Types.ObjectId(e));
    messageData = {
        ...messageData,
        recipients: participants,
    };

    if (participants.length) {
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
    }
};

export default createMessageForOtherGroupParticipants;
