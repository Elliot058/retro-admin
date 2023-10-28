/**
 * Created By Soumya(soumya@smartters.in) on 1/11/2023 at 8:13 AM.
 */
import { HookContext } from '@feathersjs/feathers';
import { MessageDeleteType } from '../../../../../db_services/v1/message/interfaces/MessageInterface';

/**
 * Check if user is trying to clear chat history
 * then set only DELETE_FOR_ME option for the user.
 * @constructor
 */
const CheckIfMessagesNotGivenSetDeleteForMe = () => async (context: HookContext) => {
    const { data } = context;
    if (!data.messages) {
        data.deleteType = MessageDeleteType.FOR_ME;
    }
};

export default CheckIfMessagesNotGivenSetDeleteForMe;
