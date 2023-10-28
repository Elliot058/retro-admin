/**
 * Created By Soumya(soumya@smartters.in) on 12/28/2022 at 1:01 PM.
 */
import { Types } from 'mongoose';

export enum GroupPermissionStatus {
    ACTIVE = 1,
    DISABLED = 2,
    DELETED = -1,
}

export enum GroupPermissionType {
    GROUP = 1,
    CHANNEL = 2,
}

export interface GroupPermission_GET {
    _id: Types.ObjectId;
    name: string;
    metaName: string;
    isAssignable: boolean;
    status: GroupPermissionStatus;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface GroupPermission_FIND {
    total: number;
    skip: number;
    limit: number;
    data: Array<GroupPermission_GET>;
}

export interface GroupPermission_POST {
    name: string;
    metaName: string;
    isAssignable: boolean;
    status?: GroupPermissionStatus;
}

export interface GroupPermission_PATCH {
    name?: string;
    metaName?: string;
    isAssignable?: boolean;
    status?: GroupPermissionStatus;
}
