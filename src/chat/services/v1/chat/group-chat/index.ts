import { Application } from '../../../../declarations';

import groupChatDetails from './details/details.service';
import groupChatMessages from './messages/messages.service';
import groupChatParticipants from './participants/participants.service';
import join from './join/join.service';

// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
    app.configure(groupChatDetails);
    app.configure(groupChatMessages);
    app.configure(groupChatParticipants);
    app.configure(join);
}
