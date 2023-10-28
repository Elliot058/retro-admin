/**
 * Created By Soumya(soumya@smarttersstudio.com) on 2/23/2022 at 9:19 PM.
 */
import { Types } from 'mongoose';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { UserGroupParticipant_GET } from '../../user-group-participants/interfaces/UserGroupParticipantInterface';

/**
 * @description interfaces for user
 */

export enum UserGroupStatus {
    ACTIVE = 1,
    ARCHIVED = 2,
    DELETED = -1,
}
export enum UserGroupType {
    PERSONAL_CHAT = 1,
    PRIVATE_GROUP_CHAT = 2,
    PUBLIC_GROUP_CHAT = 3,
    SECRET_GROUP_CHAT = 4,
}

export enum UserGroupEntityType {
    HANGOUT = 'hangout',
    COMMUNITY = 'community',
}

interface settings {
    hideChatForNewMember: boolean;
}
export interface UserGroup_GET {
    _id: Types.ObjectId;
    name: string;
    createdBy: Types.ObjectId | User_GET;
    updatedBy?: Types.ObjectId | User_GET;
    firstUser?: Types.ObjectId | User_GET;
    secondUser?: Types.ObjectId | User_GET;
    parentId?: Types.ObjectId | UserGroup_GET;
    entityType?: string;
    entityId?: Types.ObjectId;
    isTeam: boolean;
    avatar?: string;
    description?: string;
    memberCount: number;
    type: UserGroupType;
    settings?: settings;
    status: UserGroupStatus;
    createdAt: string;
    updatedAt: Date;
    __v: number;
}

export interface UserGroup_FIND {
    total: number;
    skip: number;
    limit: number;
    data: Array<UserGroup_GET>;
}
export interface UserGroup_POST {
    name: string;
    createdBy?: Types.ObjectId | User_GET;
    updatedBy?: Types.ObjectId;
    firstUser?: Types.ObjectId | User_GET;
    secondUser?: Types.ObjectId | User_GET;
    isTeam: boolean;
    parentId?: Types.ObjectId;
    parentData?: UserGroup_GET;
    avatar?: string;
    description?: string;
    memberCount?: number;
    type: UserGroupType;
    settings?: settings;
    participants?: Array<string>;
    entityType?: UserGroupEntityType;
    entityId?: string;
}
export interface UserGroup_PATCH {
    name: string;
    updatedBy: Types.ObjectId;
    avatar?: string;
    description?: string;
    settings?: settings;
}

export interface GroupWithParticipant {
    _id: Types.ObjectId;
    name: string;
    avatar: string;
    memberCount: number;
    type: number;
    participantData?: UserGroupParticipant_GET;
}
