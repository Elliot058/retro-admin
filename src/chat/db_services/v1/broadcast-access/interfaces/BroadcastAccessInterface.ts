/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 6:29 PM.
 */
import { Types } from 'mongoose';
import { Broadcast_GET } from '../../broadcast/interfaces/BroadCastInterface';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';
import { User_GET } from '../../user/interfaces/UserInterfaces';

export enum BroadcastAccessStatus {
    ACTIVE = 1,
    DELETED = -1,
}

export interface BroadcastAccess_GET {
    _id: Types.ObjectId;
    createdBy: Types.ObjectId | User_GET;
    broadcast: Types.ObjectId | Broadcast_GET;
    group: Types.ObjectId | UserGroup_GET;
    status: BroadcastAccessStatus;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface BroadcastAccess_FIND {
    total: number;
    skip: number;
    limit: number;
    data: Array<BroadcastAccess_GET>;
}

export interface BroadcastAccess_POST {
    broadcast: Types.ObjectId;
    group: Types.ObjectId;
}

export interface BroadcastAccess_QUERY {
    broadcast?: Types.ObjectId;
    group?: Types.ObjectId;
    status?: number;
    createdBy?: Types.ObjectId;
}
