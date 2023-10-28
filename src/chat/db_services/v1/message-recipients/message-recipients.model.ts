// v1/message-recipients-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../../../declarations';
import { Model, Mongoose } from 'mongoose';
import { MessageRecipientEntityType, MessageRecipientStatus } from './interfaces/MessageRecipientsInterface';

export default function (app: Application): Model<any> {
    const modelName = 'messageRecipients';
    const mongooseClient: Mongoose = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            user: {
                type: Schema?.Types.ObjectId,
                ref: 'user',
                required: true,
            },
            entityType: {
                type: String,
                required: true,
                enum: MessageRecipientEntityType,
            },
            entityId: {
                type: Schema?.Types.ObjectId,
                refPath: 'entityType',
                required: true,
            },
            message: {
                type: Schema?.Types.ObjectId,
                ref: 'message',
                required: true,
            },
            status: {
                type: Number,
                enum: MessageRecipientStatus,
                default: MessageRecipientStatus.SENT,
            },
        },
        {
            timestamps: true,
        },
    );

    schema.index({
        entityType: 1,
        entityId: 1,
        message: 1,
        user: 1,
        status: 1,
    });

    schema.index({
        entityType: 1,
        entityId: 1,
        user: 1,
        status: 1,
    });

    schema.index({
        entityId: 1,
        user: 1,
        status: 1,
    });

    schema.index({
        message: 1,
        status: 1,
    });

    schema.index({
        entityId: 1,
        status: 1,
    });

    // This is necessary to avoid model compilation errors in watch mode
    // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
    if (mongooseClient.modelNames().includes(modelName)) {
        (mongooseClient as any).deleteModel(modelName);
    }
    return mongooseClient.model<any>(modelName, schema);
}
