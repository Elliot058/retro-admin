/**
 * Created By Soumya(soumya@smarttersstudio.com) on 2/23/2022 at 9:19 PM.
 */

/**
 * @description interfaces for user request.
 */

interface UserDatum {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: 1 | 2 | 3;
    status: 1 | -1;
}

interface UserData extends Array<UserDatum> {}

export { UserDatum, UserData };
