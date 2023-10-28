// v1/message-reactions-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../../../declarations';
import { Model, Mongoose } from 'mongoose';
import { MessageReactionStatus } from './interfaces/MessageReactionInterface';

export default function (app: Application): Model<any> {
    const modelName = 'messageReactions';
    const mongooseClient: Mongoose = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            reactor: {
                type: Schema?.Types.ObjectId,
                ref: 'user',
                required: true,
            },
            emoji: {
                type: String,
                required: true,
            },
            message: {
                type: Schema?.Types.ObjectId,
                ref: 'message',
                required: true,
            },
            status: {
                type: Number,
                required: true,
                enum: [MessageReactionStatus.ACTIVE, MessageReactionStatus.DELETED],
            },
        },
        {
            timestamps: true,
        },
    );

    schema.index({
        emoji: 1,
        message: 1,
        status: 1,
    });

    schema.index({
        message: 1,
        status: 1,
    });

    // This is necessary to avoid model compilation errors in watch mode
    // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
    if (mongooseClient.modelNames().includes(modelName)) {
        (mongooseClient as any).deleteModel(modelName);
    }
    return mongooseClient.model<any>(modelName, schema);
}
