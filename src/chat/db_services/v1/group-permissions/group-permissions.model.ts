// ../db_services/v1/group-permissions-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../../../declarations';
import { Model, Mongoose } from 'mongoose';
import { GroupPermissionStatus, GroupPermissionType } from './interfaces/GroupPermissionInterface';

export default function (app: Application): Model<any> {
    const modelName = 'groupPermissions';
    const mongooseClient: Mongoose = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const { ObjectId } = Schema?.Types;
    const schema = new Schema(
        {
            name: {
                type: String,
                required: true,
            },
            metaName: {
                type: String,
                required: true,
            },
            isAssignable: {
                type: Boolean,
                required: true,
            },
            type: {
                type: Number,
                enum: GroupPermissionType,
                required: true,
            },
            status: {
                type: Number,
                enum: GroupPermissionStatus,
                default: GroupPermissionStatus.ACTIVE,
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
