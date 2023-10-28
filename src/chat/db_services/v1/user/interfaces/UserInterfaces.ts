/**
 * Created By Abhilash(abhilash@smartters.in) on 26-12-2022 at 20:14
 */
import { Types } from 'mongoose';
import { HookContext, Service } from '@feathersjs/feathers';

export enum UserRole {
    SUPER_ADMIN = 1,
    ADMIN = 2,
    USER = 3,
}

export enum UserStatus {
    ACTIVE = 1,
    REMOVED = -1,
}

export enum UserOnlineStatus {
    ONLINE = 1,
    OFFLINE = 2,
}

export interface User_GET {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    status: UserStatus;
    online: {
        status: UserOnlineStatus;
        lastSeen?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface User_FIND {
    total: number;
    skip: number;
    limit: number;
    data: Array<User_GET>;
}

export interface AllUsers extends Array<User_GET> {}

export interface User_POST {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
}

export interface User_PATCH {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
    avatar?: string;
    online?: {
        status?: UserOnlineStatus;
        lastSeen?: Date;
    };
}

export type PermitType = (context: HookContext, strict?: boolean) => HookContext<any, Service<any>>;
