/**
 * Created By Soumya(soumya@smartters.in) on 2/24/2023 at 10:33 AM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { Service } from 'feathers-mongoose';
import { messageRecipientsPath } from '../../../../../../service_endpoints/services';
import { PipelineStage, Types } from 'mongoose';
import {
    MessageRecipientEntityType,
    MessageRecipientStatus,
} from '../../../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { MessageAttachmentType } from '../../../../../../db_services/v1/message/interfaces/MessageInterface';

const GetAllMediaOfChat = () => async (context: HookContext) => {
    const { params, app } = context;

    const { query, user } = params;

    if (!query || !user) return context;

    const userData = params.user as User_GET;

    const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
    const messageRecipientModel = messageRecipientService.Model;

    const $skip = parseInt(query.$skip || '0');
    const $limit = parseInt(query.$limit || '100');

    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $match: {
                status: { $ne: MessageRecipientStatus.DELETED },
                user: userData._id,
                entityId: new Types.ObjectId(query.group),
                entityType: MessageRecipientEntityType.GROUP,
            },
        },
        {
            $lookup: {
                from: 'messages',
                localField: 'message',
                foreignField: '_id',
                as: 'message',
            },
        },
        {
            $unwind: '$message',
        },
        {
            $match: {
                'message.attachment.type': {
                    $in: [MessageAttachmentType.AUDIO, MessageAttachmentType.VIDEO, MessageAttachmentType.IMAGE],
                },
            },
        },
        {
            $sort: { 'message.createdAt': -1 },
        },
        {
            $skip: $skip,
        },
        {
            $limit: $limit,
        },
        {
            $set: {
                message: '$message',
            },
        },
        {
            $project: {
                message: {
                    _id: 1,
                    // text: 1,
                    attachment: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
                _id: 0,
            },
        },
    );

    context.result = await messageRecipientModel.aggregate(aggregateQuery, { allowDiskUse: true });
};

export default GetAllMediaOfChat;
