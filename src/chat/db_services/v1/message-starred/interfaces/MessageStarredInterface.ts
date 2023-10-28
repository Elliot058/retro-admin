/**
 * Created By Soumya(soumya@smartters.in) on 2/22/2023 at 3:58 PM.
 */

import { Types } from 'mongoose';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { Message_GET, MessageEntityType } from '../../message/interfaces/MessageInterface';
import { UserGroup_GET } from '../../user-group/interfaces/UserGroupInterface';

export enum MessageStarredStatus {
    ACTIVE = 1,
    DELETED = -1,
}

export interface MessageStarred_GET {
    _id: Types.ObjectId;
    user: Types.ObjectId | User_GET;
    message: Types.ObjectId | Message_GET;
    entityType: MessageEntityType;
    entityId: Types.ObjectId | UserGroup_GET;
    status: MessageStarredStatus;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface MessageStarred_FIND {
    total: number;
    skip: number;
    limit: number;
    data: Array<MessageStarred_GET>;
}

export interface MessageStarred_POST {
    user: Types.ObjectId;
    message: Types.ObjectId;
    entityType?: MessageEntityType;
    entityId?: Types.ObjectId;
}
