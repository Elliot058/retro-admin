// v1/user-group-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../../../declarations';
import { Model, Mongoose } from 'mongoose';
import {UserGroupEntityType, UserGroupStatus, UserGroupType} from './interfaces/UserGroupInterface';

export default function (app: Application): Model<any> {
    const modelName = 'userGroup';
    const mongooseClient: Mongoose = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            name: {
                type: String,
            },
            createdBy: {
                type: Schema?.Types.ObjectId,
                ref: 'user',
                required: true,
            },
            updatedBy: {
                type: Schema?.Types.ObjectId,
                ref: 'user',
            },
            firstUser: {
                type: Schema?.Types.ObjectId,
                ref: 'user',
            },
            secondUser: {
                type: Schema?.Types.ObjectId,
                ref: 'user',
            },
            parentId: {
                type: Schema?.Types.ObjectId,
                ref: 'userGroup',
                index: true,
            },
            entityType: {
                type: String,
                enum: UserGroupEntityType,
            },
            entityId: {
                type: Schema?.Types.ObjectId,
                refPath: 'entityType',
            },
            avatar: {
                type: String,
            },
            description: {
                type: String,
            },
            memberCount: {
                type: Number,
                default: 0,
            },
            type: {
                type: Number,
                enum: UserGroupType,
                required: true,
            },
            settings: {
                hideChatForNewMember: {
                    type: Boolean,
                    default: false,
                },
            },
            isTeam: {
                type: Boolean,
                default: false,
            },
            status: {
                type: Number,
                default: UserGroupStatus.ACTIVE,
                enum: UserGroupStatus,
            },
        },
        {
            timestamps: true,
        },
    );

    schema.index({
        createdBy: 1,
        firstUser: 1,
        secondUser: 1,
        type: 1,
        status: 1,
    });

    schema.index({
        firstUser: 1,
        secondUser: 1,
        type: 1,
        status: 1,
    });
    schema.index({
        type: 1,
        status: 1,
    });
    schema.index({
        status: 1,
    });

    // This is necessary to avoid model compilation errors in watch mode
    // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
    if (mongooseClient.modelNames().includes(modelName)) {
        (mongooseClient as any).deleteModel(modelName);
    }
    return mongooseClient.model<any>(modelName, schema);
}
