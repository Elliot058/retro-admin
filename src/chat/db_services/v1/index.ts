import { Application } from '../../declarations';

import userGroup from './user-group/user-group.service';
import userGroupParticipants from './user-group-participants/user-group-participants.service';

import message from './message/message.service';
import messageRecipients from './message-recipients/message-recipients.service';
import messageReactions from './message-reactions/message-reactions.service';
import messagePinned from './message-pinned/message-pinned.service';
import messageStarred from './message-starred/message-starred.service';

import groupPermissions from './group-permissions/group-permissions.service';

import broadcast from './broadcast/broadcast.service';
import broadcastAccess from './broadcast-access/broadcast-access.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
    app.configure(userGroup);
    app.configure(userGroupParticipants);

    app.configure(message);
    app.configure(messageReactions);
    app.configure(messageRecipients);
    app.configure(messagePinned);
    app.configure(messageStarred);

    app.configure(groupPermissions);

    app.configure(broadcast);
    app.configure(broadcastAccess);
}
