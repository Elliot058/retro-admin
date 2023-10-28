/**
 * Created By Soumya(soumya\@smartters.in) on 4/5/2023 at 7:28 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { MessageReactions } from '../message-reactions.class';
import { messageReactionsPath } from '../../../../service_endpoints/services';
import {
    MessageReaction_FIND,
    MessageReaction_POST,
    MessageReactionStatus,
} from '../interfaces/MessageReactionInterface';

const CheckIfReactionAlreadyGiven = () => async (context: HookContext) => {
    const { data, app } = context;

    const messageReactionService: MessageReactions & ServiceAddons<any> = app.service(messageReactionsPath);

    const { reactor, message, emoji } = data as MessageReaction_POST;

    const messageReactionQuery = {
        reactor,
        message,
        status: MessageReactionStatus.ACTIVE,
        $limit: 1,
    };

    const messageReactionData = await messageReactionService
        ._find({
            query: messageReactionQuery,
        })
        .then((res: MessageReaction_FIND) => (res.total ? res.data[0] : null));

    if (messageReactionData) {
        context.result = await messageReactionService._patch(messageReactionData._id.toString(), {
            emoji,
        });
    }

    return context;
};

export default CheckIfReactionAlreadyGiven;
