/**
 * Created By Soumya(soumya@smartters.in) on 1/15/2023 at 5:42 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { UserGroup_GET } from '../../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import { Service } from 'feathers-mongoose';
import { userGroupParticipantsPath } from '../../../../../../service_endpoints/services';
import { BadRequest } from '@feathersjs/errors';
import {
    UserGroupParticipant_GET,
    UserGroupParticipantStatus,
} from '../../../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import { Types } from 'mongoose';

const GetUserDataAndParticipants = () => async (context: HookContext) => {
    const { data, id, app, method, params } = context;
    let groupData: UserGroup_GET | Types.ObjectId;

    const userParticipantService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);

    if (method === 'patch') {
        if (!id) throw new BadRequest('Invalid user participant.');
        const userParticipantData = await userParticipantService
            ._get(id.toString(), {
                query: {
                    $populate: ['group'],
                },
            })
            .then((res: UserGroupParticipant_GET) => res)
            .catch(() => {
                throw new BadRequest('User participant not found.');
            });
        groupData = userParticipantData.group;
        data.groupData = groupData;
        data.participantData = userParticipantData;
    } else {
        groupData = data.groupData;
    }

    params.participants = await userParticipantService
        ._find({
            query: {
                group: groupData._id,
                status: UserGroupParticipantStatus.ACTIVE,
                $select: ['participant'],
            },
            paginate: false,
        })
        .then((res: Array<UserGroupParticipant_GET>) => res.map((e) => e.participant.toString()));

    return context;
};

export default GetUserDataAndParticipants;
