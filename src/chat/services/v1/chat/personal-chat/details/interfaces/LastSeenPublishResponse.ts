/**
 * Created By Soumya(soumya@smartters.in) on 1/10/2023 at 3:47 PM.
 */
import { Types } from 'mongoose';
import { UserOnlineStatus } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';

export interface LastSeenPublishResponse {
    group: Types.ObjectId;
    sender: Types.ObjectId;
    online: {
        status?: UserOnlineStatus;
        lastSeen?: Date;
    };
    user: Types.ObjectId;
}
