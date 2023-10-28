/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 9:29 PM.
 */
import { Broadcast_GET } from '../../../../../../db_services/v1/broadcast/interfaces/BroadCastInterface';

export interface BroadcastChatAccess_POST {
    broadcastData: Broadcast_GET;
    groups: Array<string>;
}

export interface BroadcastChatAccess_PATCH {
    broadcastData: Broadcast_GET;
}
