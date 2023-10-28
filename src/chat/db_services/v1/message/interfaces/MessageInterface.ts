/**
 * Created By Soumya(soumya@smarttersstudio.com) on 2/23/2022 at 9:19 PM.
 */
import { Types } from 'mongoose';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { Broadcast_GET } from '../../broadcast/interfaces/BroadCastInterface';

/**
 * @description interfaces for Message
 */

export enum MessageStatus {
    ACTIVE = 1,
    SEEN = 2,
    DELETED = -1,
}

export enum MessageEntityType {
    USER_GROUP = 'userGroup',
    BROADCAST = 'broadcast',
}

export enum MessageAttachmentType {
    IMAGE = 1,
    VIDEO = 2,
    AUDIO = 3,
    DOCUMENT = 4,
}

export enum MessageType {
    NORMAL_MESSAGE = 1,
    ACTION = 2,
}

export interface Message_GET {
    _id: Types.ObjectId;
    sender: Types.ObjectId | User_GET;
    parentMessage?: Types.ObjectId | Message_GET;
    entityType: MessageEntityType;
    entityId: Types.ObjectId | UserGroup_GET | Broadcast_GET;
    broadcastMessage?: Types.ObjectId | Message_GET;
    text?: string;
    type: MessageType;
    mentionedUsers?: Array<Types.ObjectId | User_GET>;
    attachment?: {
        type: MessageAttachmentType;
        data: string;
        thumbnail?: string;
        metadata?: {
            size?: number;
            duration?: number;
        };
    };
    status: MessageStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface Message_FIND {
    total: number;
    skip: number;
    limit: number;
    data: Array<Message_GET>;
}

export interface Message_POST {
    sender: Types.ObjectId | User_GET;
    parentMessage?: Types.ObjectId | Message_GET;
    entityType: MessageEntityType;
    entityId: Types.ObjectId | UserGroup_GET | Broadcast_GET;
    text?: string;
    type: MessageType;
    attachment?: {
        type: MessageAttachmentType;
        data: string;
        thumbnail?: string;
        metadata?: {
            size?: number;
            duration?: number;
        };
    };
    attachmentType?: string;
    entityIdData?: UserGroup_GET | Broadcast_GET;
    broadcastMessage?: Types.ObjectId | Message_GET;
    recipients?: Array<Types.ObjectId>;
    files?: Express.Multer.File[];
    mentionedUsers?: Types.ObjectId[];
}
export interface Message_PATCH {
    parentMessage?: Types.ObjectId | Message_GET;
    entityType: MessageEntityType;
    entityId: Types.ObjectId | UserGroup_GET;
    text: string;
    attachment: {
        type: MessageAttachmentType;
        data: string;
        thumbnail?: string;
        metadata?: {
            size?: number;
            duration?: number;
        };
    };
    status?: MessageStatus;
    entityIdData?: UserGroup_GET;
    recipients?: Array<Types.ObjectId>;
}

export enum MessageDeleteType {
    FOR_ME = 1,
    FOR_EVERYONE = 2,
}
export interface MessageDelete_Post {
    deleteType: MessageDeleteType;
    group: string;
    messages?: Array<string>;
}

export interface Message_Query {
    status?: any;
    type?: MessageType;
    entityId?: Types.ObjectId;
    entityType?: MessageEntityType;
    sender?: Types.ObjectId;
    _id?: any;
    $sort?: any;
    $limit?: any;
    $select?: any;
}
