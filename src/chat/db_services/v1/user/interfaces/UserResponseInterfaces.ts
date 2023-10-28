/**
 * Created By Soumya(soumya@smarttersstudio.com) on 2/23/2022 at 9:19 PM.
 */
import { Types } from 'mongoose';
/**
 * @description interfaces for user
 */

interface User {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: 1 | 2 | 3;
    status: 1 | -1;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

interface Users {
    total: number;
    skip: number;
    limit: number;
    data: Array<User>;
}

interface AllUsers extends Array<User> {}

export { User, Users, AllUsers };
