/**
 * Created By Soumya(soumya@smartters.in) on 2/22/2023 at 1:56 PM.
 */
import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { Application, ServiceAddons } from '@feathersjs/feathers';
import { userGroupParticipantsPath } from '../../../../../../service_endpoints/services';
import { Types } from 'mongoose';
import {
    UserGroupParticipant_GET,
    UserGroupParticipantStatus,
} from '../../../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';

/**
 * Get user participant data of the group.
 * @param userData
 * @param groupId
 * @param app
 */
const getUserParticipantData = async (userData: User_GET, groupId: string, app: Application) => {
    const userParticipantService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);
    return await userParticipantService.Model.aggregate([
        {
            $sort: { createdAt: -1 },
        },
        {
            $match: {
                participant: userData._id,
                group: new Types.ObjectId(groupId),
                status: UserGroupParticipantStatus.ACTIVE,
            },
        },
        {
            $lookup: {
                from: 'grouppermissions',
                localField: 'permissions',
                foreignField: '_id',
                as: 'permissions',
            },
        },
        {
            $lookup: {
                from: 'lives',
                let: { groupId: '$group' },
                pipeline: [
                    {
                        $sort: {
                            createdAt: -1,
                        },
                    },
                    {
                        $match: {
                            status: 1,
                            groups: {
                                $in: [new Types.ObjectId(groupId)],
                            },
                        },
                    },
                    { $limit: 1 },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            createdBy: 1,
                            group: { $arrayElemAt: ['$groups', 0] },
                        },
                    },
                ],
                as: 'live',
            },
        },
        {
            $unwind: { path: '$live', preserveNullAndEmptyArrays: true },
        },
        {
            $project: {
                _id: 1,
                status: 1,
                permissions: {
                    _id: 1,
                    name: 1,
                    metaName: 1,
                    isAssignable: 1,
                },
                live: 1,
            },
        },
    ]).then((res: Array<UserGroupParticipant_GET>) => res[0]);
};

export default getUserParticipantData;
