// v1/message-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../../../declarations';
import { Model, Mongoose } from 'mongoose';
import { MessageAttachmentType, MessageEntityType, MessageStatus, MessageType } from './interfaces/MessageInterface';

export default function (app: Application): Model<any> {
    const modelName = 'message';
    const mongooseClient: Mongoose = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            sender: {
                type: Schema?.Types.ObjectId,
                ref: 'user',
                required: true,
            },
            parentMessage: {
                type: Schema?.Types.ObjectId,
                ref: 'message',
            },
            entityType: {
                type: String,
                enum: MessageEntityType,
                required: true,
            },
            entityId: {
                type: Schema?.Types.ObjectId,
                refPath: 'entityType',
                required: true,
            },
            broadcastMessage: {
                type: Schema?.Types.ObjectId,
                ref: 'message',
            },
            text: {
                type: String,
            },
            attachment: {
                type: {
                    type: Number,
                    enum: MessageAttachmentType,
                },
                data: {
                    type: String,
                },
                thumbnail: {
                    type: String,
                },
                metadata: {
                    size: {
                        type: Number,
                    },
                    duration: {
                        type: Number,
                    },
                },
            },
            type: {
                type: Number,
                enum: MessageType,
                required: true,
            },
            mentionedUsers: [
                {
                    type: Schema?.Types.ObjectId,
                    ref: 'user',
                },
            ],
            status: {
                type: Number,
                enum: MessageStatus,
                default: MessageStatus.ACTIVE,
            },
        },
        {
            timestamps: true,
        },
    );

    schema.index({
        sender: 1,
        entityType: 1,
        entityId: 1,
        type: 1,
        status: 1,
    });

    schema.index({
        entityType: 1,
        entityId: 1,
        type: 1,
        status: 1,
    });

    schema.index({
        type: 1,
        status: 1,
    });

    schema.index({
        entityId: 1,
        type: 1,
        status: 1,
    });

    // This is necessary to avoid model compilation errors in watch mode
    // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
    if (mongooseClient.modelNames().includes(modelName)) {
        (mongooseClient as any).deleteModel(modelName);
    }
    return mongooseClient.model<any>(modelName, schema);
}
