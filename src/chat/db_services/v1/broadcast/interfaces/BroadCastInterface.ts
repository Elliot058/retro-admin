/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 4:58 PM.
 */
import { Types } from 'mongoose';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';

export enum BroadCastStatus {
    ACTIVE = 1,
    DELETED = -1,
}

export interface Broadcast_GET {
    _id: Types.ObjectId;
    createdBy: Types.ObjectId | User_GET;
    updatedBy?: Types.ObjectId | User_GET;
    name: string;
    description?: string;
    avatar?: string;
    groupCount: number;
    status: BroadCastStatus;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface Broadcast_FIND {
    total: number;
    limit: number;
    skip: number;
    data: Array<Broadcast_GET>;
}

export interface Broadcast_POST {
    createdBy?: Types.ObjectId | User_GET;
    name: string;
    description?: string;
    avatar?: string;
    groupsData?: Array<UserGroup_GET>;
}

export interface Broadcast_PATCH {
    updatedBy?: Types.ObjectId | User_GET;
    name?: string;
    description?: string;
    avatar?: string;
    groupCount?: number;
}

export interface Broadcast_QUERY {
    createdBy?: Types.ObjectId;
    name?: string;
    status?: number;
}
