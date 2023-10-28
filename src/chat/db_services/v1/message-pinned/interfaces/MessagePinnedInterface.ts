/**
 * Created By Soumya(soumya@smartters.in) on 2/22/2023 at 3:58 PM.
 */

import { Types } from 'mongoose';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { Message_GET, MessageEntityType } from '../../message/interfaces/MessageInterface';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';

export enum MessagePinnedStatus {
    ACTIVE = 1,
    DELETED = -1,
}

export interface MessagePinned_GET {
    _id: Types.ObjectId;
    createdBy: Types.ObjectId | User_GET;
    user: Types.ObjectId | User_GET;
    message: Types.ObjectId | Message_GET;
    entityType: MessageEntityType;
    entityId: Types.ObjectId | UserGroup_GET;
    status: MessagePinnedStatus;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface MessagePinned_FIND {
    total: number;
    skip: number;
    limit: number;
    data: Array<MessagePinned_GET>;
}

export interface MessagePinned_POST {
    createdBy: Types.ObjectId;
    message: Types.ObjectId;
    entityType?: MessageEntityType;
    entityId?: Types.ObjectId;
}
