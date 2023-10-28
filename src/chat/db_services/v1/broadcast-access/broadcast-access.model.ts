// ../db_services/v1/broadcast-access-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../../../declarations';
import { Model, Mongoose } from 'mongoose';
import { BroadcastAccessStatus } from './interfaces/BroadcastAccessInterface';

export default function (app: Application): Model<any> {
    const modelName = 'broadcastAccess';
    const mongooseClient: Mongoose = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const { ObjectId } = Schema?.Types;
    const schema = new Schema(
        {
            //id of the admin who created it
            createdBy: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                required: true,
            },
            //id of the broadcast
            broadcast: {
                type: ObjectId,
                ref: 'broadcast',
                required: true,
            },
            //id of the group
            group: {
                type: ObjectId,
                ref: 'userGroup',
                required: true,
            },
            //status of the broadcast-group-access
            //1-active
            //0-deleted
            status: {
                type: Number,
                enum: BroadcastAccessStatus,
                default: BroadcastAccessStatus.ACTIVE,
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
