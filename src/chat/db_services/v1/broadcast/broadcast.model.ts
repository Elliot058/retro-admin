// ../db_services/v1/broadcast-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../../../declarations';
import { Model, Mongoose } from 'mongoose';
import { BroadCastStatus } from './interfaces/BroadCastInterface';

export default function (app: Application): Model<any> {
    const modelName = 'broadcast';
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
            updatedBy: {
                type: ObjectId,
                ref: 'user',
            },
            //name of the broadcast
            name: {
                type: String,
                required: true,
            },
            //description of the broadcast
            description: {
                type: String,
            },
            //image of the broadcast
            avatar: {
                type: String,
            },
            //no. of group exists in this broadcast
            groupCount: {
                type: Number,
                default: 0,
            },
            //status of the broadcast
            //1-active
            status: {
                type: Number,
                enum: BroadCastStatus,
                default: BroadCastStatus.ACTIVE,
            },
        },
        {
            timestamps: true,
        },
    );

    // This is necessary to avoid model compilation errors in watch mode
    // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
    if (mongooseClient.modelNames().includes(modelName)) {
        (mongooseClient as any).deleteModel(modelName);
    }
    return mongooseClient.model<any>(modelName, schema);
}
