/**
 * Created By Soumya(soumya@smarttersstudio.com) on 2/23/2022 at 9:19 PM.
 */
import { Types } from 'mongoose';
import { GroupPermission_GET } from '../../group-permissions/interfaces/GroupPermissionInterface';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';

/**
 * @description interfaces for user
 */

export enum UserGroupParticipantStatus {
    ACTIVE = 1,
    REQUESTED = 2,
    LEFT = -1,
}

export interface UserGroupParticipant_GET {
    _id: Types.ObjectId;
    createdBy: Types.ObjectId | User_GET;
    updatedBy?: Types.ObjectId | User_GET;
    participant: Types.ObjectId | User_GET;
    group: Types.ObjectId | UserGroup_GET;
    status: UserGroupParticipantStatus;
    permissions: Array<Types.ObjectId | GroupPermission_GET>;
    createdAt: string;
    updatedAt: Date;
    __v: number;
}

export interface UserGroupParticipant_FIND {
    total: number;
    skip: number;
    limit: number;
    data: Array<UserGroupParticipant_GET>;
}
export interface UserGroupParticipant_POST {
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    participant: Types.ObjectId;
    participants?: Array<Types.ObjectId>;
    permissions?: Array<Types.ObjectId>;
    group: Types.ObjectId;
    groupData?: UserGroup_GET;
    status?: UserGroupParticipantStatus;
    isUserAdmin?: boolean;
}
export interface UserGroupParticipant_PATCH {
    status?: UserGroupParticipantStatus;
    permissions?: Array<Types.ObjectId | GroupPermission_GET>;
    participantData?: UserGroupParticipant_GET;
}
export interface UserGroupParticipant_QUERY {
    participant?: any;
    group?: Types.ObjectId;
    status?: UserGroupParticipantStatus;
}
