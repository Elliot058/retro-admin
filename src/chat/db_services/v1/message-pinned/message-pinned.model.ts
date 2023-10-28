// ../db_services/v1/message-pinned-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../../../declarations';
import { Model, Mongoose } from 'mongoose';
import { MessageEntityType } from '../message/interfaces/MessageInterface';
import { MessagePinnedStatus } from './interfaces/MessagePinnedInterface';

export default function (app: Application): Model<any> {
    const modelName = 'messagePinned';
    const mongooseClient: Mongoose = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const { ObjectId } = Schema?.Types;
    const schema = new Schema(
        {
            createdBy: {
                type: ObjectId,
                ref: 'user',
                required: true,
            },
            user: {
                type: ObjectId,
                ref: 'user',
                index: true,
            },
            message: {
                type: ObjectId,
                ref: 'message',
                required: true,
                index: true,
            },
            entityType: {
                type: String,
                enum: MessageEntityType,
                required: true,
                index: true,
            },
            entityId: {
                type: ObjectId,
                required: true,
                refPath: 'entityType',
                index: true,
            },
            status: {
                type: Number,
                enum: MessagePinnedStatus,
                default: MessagePinnedStatus.ACTIVE,
                index: true,
            },
        },
        {
            timestamps: true,
        },
    );

    schema.index({
        user: 1,
        entityType: 1,
        entityId: 1,
        status: 1,
    });

    schema.index({
        user: 1,
        message: 1,
        entityId: 1,
        status: 1,
    });

    schema.index({
        entityType: 1,
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
