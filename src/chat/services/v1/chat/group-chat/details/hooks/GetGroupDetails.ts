/**
 * Created By Soumya(soumya@smartters.in) on 1/2/2023 at 9:51 AM.
 */

import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { userGroupPath } from '../../../../../../service_endpoints/services';
import { PipelineStage, Types } from 'mongoose';
import {
    UserGroupStatus,
    UserGroupType,
} from '../../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';
import {
    UserGroupParticipant_GET,
    UserGroupParticipantStatus,
} from '../../../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';

const GetGroupDetails = () => async (context: HookContext) => {
    const { params, app, id } = context;

    const { user } = params;

    if (!user || !id) return context;

    const userData = params.user as User_GET;

    const groupService: Service & ServiceAddons<any> = app.service(userGroupPath);
    const groupModel = groupService.Model;

    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $match: {
                status: UserGroupStatus.ACTIVE,
                _id: new Types.ObjectId(id),
                type: { $ne: UserGroupType.PERSONAL_CHAT },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy',
            },
        },
        {
            $unwind: { path: '$createdBy' },
        },
        {
            $lookup: {
                from: 'usergroupparticipants',
                let: { groupId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$group', '$$groupId'] },
                            status: { $in: [UserGroupParticipantStatus.ACTIVE, UserGroupParticipantStatus.REQUESTED] },
                        },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'participant',
                            foreignField: '_id',
                            as: 'participant',
                        },
                    },
                    {
                        $unwind: { path: '$participant' },
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
                        $project: {
                            status: 1,
                            participant: {
                                _id: 1,
                                name: '$participant.name',
                                phone: 1,
                                avatar: 1,
                                online: 1,
                            },
                            permissions: {
                                _id: 1,
                                name: 1,
                                metaName: 1,
                                isAssignable: 1,
                            },
                        },
                    },
                ],
                as: 'participants',
            },
        },
        {
            $project: {
                name: 1,
                createdBy: {
                    _id: 1,
                    name: '$createdBy.name',
                    phone: 1,
                    avatar: 1,
                },
                parentId: 1,
                avatar: 1,
                description: 1,
                memberCount: 1,
                type: 1,
                createdAt: 1,
                updatedAt: 1,
                participants: 1,
            },
        },
    );

    const response = await groupModel.aggregate(aggregateQuery);

    if (!response.length) {
        context.result = {};
        return context;
    }

    let userFound = false;
    let participantData;
    (response[0].participants as Array<UserGroupParticipant_GET>).forEach((e) => {
        if (e.participant._id.toString() === userData._id.toString()) {
            userFound = true;
            if (e.status === UserGroupParticipantStatus.REQUESTED) participantData = e;
        }
    });
    // if (!userFound) throw new Forbidden('You are not allowed to get the details of this group.');
    if (!userFound) {
        delete response[0].participants;
    } else if (participantData) {
        response[0].participants = [participantData];
    }

    context.result = response[0];
};

export default GetGroupDetails;
