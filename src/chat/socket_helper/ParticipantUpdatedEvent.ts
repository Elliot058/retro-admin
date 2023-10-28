/**
 * Created By Soumya(soumya@smartters.in) on 1/11/2023 at 12:48 PM.
 */
import { UserGroupParticipant_GET } from '../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import { HookContext } from '@feathersjs/feathers';

/**
 * Participant updated event.
 * @param result
 * @param context
 * @constructor
 */
const ParticipantUpdatedEvent = async (result: UserGroupParticipant_GET, context: HookContext) => {
    const { app, params } = context;
    const { participants } = params;

    // console.log('participants', participants);

    return participants.map((e: any) => {
        return app.channel(`userIds/${e.toString()}`);
    });
};

export default ParticipantUpdatedEvent;
