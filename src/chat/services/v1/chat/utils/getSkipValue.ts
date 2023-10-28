/**
 * Created By Soumya(soumya@smartters.in) on 2/21/2023 at 8:07 PM.
 */
import { PipelineStage, Types } from 'mongoose';
import { Service } from 'feathers-mongoose';
import { Application, ServiceAddons } from '@feathersjs/feathers';
import { messageRecipientsPath } from '../../../../service_endpoints/services';
import {
    MessageRecipientEntityType,
    MessageRecipientStatus,
} from '../../../../db_services/v1/message-recipients/interfaces/MessageRecipientsInterface';
import { User_GET } from '../../../../db_services/v1/user/interfaces/UserInterfaces';
import { BadRequest } from '@feathersjs/errors';

const GetSkipValue = async (id: Types.ObjectId, userData: User_GET, app: Application, groupId: string) => {
    const messageRecipientService: Service & ServiceAddons<any> = app.service(messageRecipientsPath);
    const messageRecipientModel = messageRecipientService.Model;

    const aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(
        {
            $match: {
                status: { $ne: MessageRecipientStatus.DELETED },
                user: userData._id,
                entityId: new Types.ObjectId(groupId),
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
            $setWindowFields: {
                sortBy: {
                    'message.createdAt': 1,
                },
                output: {
                    documentNumber: {
                        $documentNumber: {}, // to get the document number of the documents fetched according to the required parameters.
                    },
                },
            },
        },
        {
            $match: {
                'message._id': id,
            },
        },
    );

    const response = await messageRecipientModel.aggregate(aggregateQuery);
    // console.log(response);
    const index = response[0] ? response[0].documentNumber : undefined;
    if (!index) throw new BadRequest('Message not found.');

    return index <= 10 ? 0 : index - 10;
};

export default GetSkipValue;
