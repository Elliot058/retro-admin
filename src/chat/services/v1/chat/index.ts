import { Application } from '../../../declarations';

import groupChat from './group-chat';
import personalChat from './personal-chat';
import broadcastChat from './broadcast-chat';
import allChats from './all-chats/all-chats.service';
import deleteMessages from './delete-messages/delete-messages.service';
import searchMessage from './search-message/search-message.service';
import seenMessages from './seen-messages/seen-messages.service';
import pinMessage from './pin-message/pin-message.service';
import starMessage from './star-message/star-message.service';
import reactMessage from './react-message/react-message.service';
import gallery from './gallery';

// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
    app.configure(personalChat);
    app.configure(groupChat);
    app.configure(broadcastChat);
    app.configure(allChats);
    app.configure(deleteMessages);
    app.configure(searchMessage);
    app.configure(seenMessages);
    app.configure(pinMessage);
    app.configure(starMessage);
    app.configure(reactMessage);
    app.configure(gallery);
}
