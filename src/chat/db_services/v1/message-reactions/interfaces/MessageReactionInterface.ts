/**
 * Created By Soumya(soumya@smarttersstudio.com) on 2/23/2022 at 9:19 PM.
 */
import { Types } from 'mongoose';
import { User_GET } from '../../user/interfaces/UserInterfaces';
import { Message_GET } from '../../message/interfaces/MessageInterface';

/**
 * @description interfaces for message reaction
 */

export enum MessageReactionStatus {
    ACTIVE = 1,
    DELETED = -1,
}

export interface MessageReaction_GET {
    _id: Types.ObjectId;
    reactor: Types.ObjectId | User_GET;
    message: Types.ObjectId | Message_GET;
    emoji: string;
    status: MessageReactionStatus;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface MessageReaction_FIND {
    total: number;
    skip: number;
    limit: number;
    data: Array<MessageReaction_GET>;
}

export interface MessageReaction_POST {
    reactor: Types.ObjectId;
    message: Types.ObjectId;
    emoji: string;
}
