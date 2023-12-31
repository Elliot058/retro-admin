import { Application } from '../../../../declarations';

import personalChatDetails from './details/details.service';
import personalChatMessages from './messages/messages.service';

// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
    app.configure(personalChatDetails);
    app.configure(personalChatMessages);
}
