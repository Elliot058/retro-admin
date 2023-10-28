/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 8:34 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../db_services/v1/user/interfaces/UserInterfaces';
import { PipelineStage, Types } from 'mongoose';
import { Service } from 'feathers-mongoose';
import { broadcastPath } from '../../../../service_endpoints/services';
import { BroadcastAccessStatus } from '../../../../db_services/v1/broadcast-access/interfaces/BroadcastAccessInterface';
import { BroadCastStatus } from '../../../../db_services/v1/broadcast/interfaces/BroadCastInterface';
import { UserGroupParticipantStatus } from '../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';

/**
 * Get all the broadcasts for the user.
 * @constructor
 */
const GetAllBroadcastsForUser = () => async (context: HookContext) => {
    const { app, params, id } = context;
    const { user, query = {} } = params;
    if (!user) return context;

    const userData = user as User_GET;

    let { $skip = '0', $limit = '300' } = query;

    $skip = parseInt($skip);
    $limit = parseInt($limit);

    const broadcastService: Service & ServiceAddons<any> = app.service(broadcastPath);
    const broadcastModel = broadcastService.Model;

    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $match: {
                status: BroadCastStatus.ACTIVE,
                createdBy: userData._id,
                _id: id ? new Types.ObjectId(id) : { $ne: null },
            },
        },
        { $skip },
        { $limit },
        {
            $project: {
                name: 1,
                description: 1,
                avatar: 1,
                groupCount: 1,
            },
        },
        {
            $lookup: {
                from: 'broadcastaccesses',
                let: { broadCastId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            status: BroadcastAccessStatus.ACTIVE,
                            $expr: { $eq: ['$broadcast', '$$broadCastId'] },
                        },
                    },
                    {
                        $lookup: {
                            from: 'usergroups',
                            localField: 'group',
                            foreignField: '_id',
                            as: 'group',
                        },
                    },
                    {
                        $unwind: { path: '$group', preserveNullAndEmptyArrays: true },
                    },
                    {
                        $project: {
                            _id: '$group._id',
                            name: '$group.name',
                            description: '$group.description',
                            avatar: '$group.avatar',
                            memberCount: '$group.memberCount',
                            type: '$group.type',
                            accessId: '$_id',
                        },
                    },
                    {
                        $lookup: {
                            from: 'usergroupparticipants',
                            let: { groupId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ['$group', '$$groupId'] },
                                        status: UserGroupParticipantStatus.ACTIVE,
                                        participant: userData._id,
                                    },
                                },
                                {
                                    $project: {
                                        _id: 1,
                                    },
                                },
                            ],
                            as: 'groupParticipantData',
                        },
                    },
                    {
                        $unwind: { path: '$groupParticipantData', preserveNullAndEmptyArrays: true },
                    },
                ],
                as: 'groups',
            },
        },
    );

    context.result = await broadcastModel.aggregate(aggregateQuery);
};

export default GetAllBroadcastsForUser;
