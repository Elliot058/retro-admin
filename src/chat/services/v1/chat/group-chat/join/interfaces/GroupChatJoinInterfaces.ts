/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 3:02 PM.
 */
import { UserGroup_GET } from '../../../../../../db_services/v1/user-group/interfaces/UserGroupInterface';

export interface GroupJoin {
    group: string;
    groupData?: UserGroup_GET;
}
