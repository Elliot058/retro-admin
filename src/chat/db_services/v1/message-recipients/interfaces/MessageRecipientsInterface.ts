/**
 * Created By Soumya(soumya@smarttersstudio.com) on 2/23/2022 at 9:19 PM.
 */
import { Types } from 'mongoose';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';
import { Message_GET } from '../../message/interfaces/MessageInterface';

/**
 * @description interfaces for user
 */

export enum MessageRecipientStatus {
    SENT = 1,
    SEEN = 2,
    DELETED = -1,
}

export enum MessageRecipientEntityType {
    GROUP = 'userGroup',
    BROADCAST = 'broadcast',
}

export interface MessageRecipient_GET {
    _id: Types.ObjectId;
    user: Types.ObjectId | User_GET;
    entityType: MessageRecipientEntityType;
    entityId: Types.ObjectId | UserGroup_GET;
    message: Types.ObjectId | Message_GET;
    status: MessageRecipientStatus;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface MessageRecipient_FIND {
    total: number;
    skip: number;
    limit: number;
    data: Array<MessageRecipient_GET>;
}

export interface MessageRecipient_POST {
    user: Types.ObjectId;
    entityType: MessageRecipientEntityType;
    entityId: Types.ObjectId;
    message: Types.ObjectId;
    status?: MessageRecipientStatus;
}

export interface MessageRecipient_PATCH {
    status?: MessageRecipientStatus;
}

export interface MessageRecipient_QUERY {
    user?: any;
    entityType?: MessageRecipientEntityType;
    entityId?: any;
    message?: any;
    status?: MessageRecipientStatus | { $ne: MessageRecipientStatus } | { $in: [MessageRecipientStatus] };
}
