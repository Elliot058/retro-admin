// v1/user-group-participants-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../../../declarations';
import { Model, Mongoose } from 'mongoose';
import { UserGroupParticipantStatus } from './interfaces/UserGroupParticipantInterface';

export default function (app: Application): Model<any> {
    const modelName = 'userGroupParticipants';
    const mongooseClient: Mongoose = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            createdBy: {
                type: Schema?.Types.ObjectId,
                ref: 'user',
                required: true,
                index: true,
            },
            updatedBy: {
                type: Schema?.Types.ObjectId,
                ref: 'user',
                index: true,
            },
            participant: {
                type: Schema?.Types.ObjectId,
                ref: 'user',
                required: true,
                index: true,
            },
            group: {
                type: Schema?.Types.ObjectId,
                ref: 'userGroup',
                required: true,
                index: true,
            },
            status: {
                type: Number,
                default: UserGroupParticipantStatus.ACTIVE,
                enum: UserGroupParticipantStatus,
                index: true,
            },
            permissions: [
                {
                    type: Schema?.Types.ObjectId,
                    ref: 'groupPermissions',
                    required: true,
                },
            ],
        },
        {
            timestamps: true,
        },
    );

    schema.index({
        status: 1,
        permissions: 1,
        createdBy: 1,
        participant: 1,
        group: 1,
    });

    schema.index({
        status: 1,
        permissions: 1,
        participant: 1,
        group: 1,
    });

    schema.index({
        status: 1,
        permissions: 1,
        group: 1,
    });

    schema.index({
        status: 1,
        participant: 1,
        group: 1,
    });

    schema.index({
        status: 1,
    });
    schema.index({
        permissions: 1,
    });
    schema.index({
        status: 1,
        permissions: 1,
    });
    schema.index({
        status: 1,
        participant: 1,
    });
    schema.index({
        status: 1,
        group: 1,
    });

    // This is necessary to avoid model compilation errors in watch mode
    // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
    if (mongooseClient.modelNames().includes(modelName)) {
        (mongooseClient as any).deleteModel(modelName);
    }
    return mongooseClient.model<any>(modelName, schema);
}
