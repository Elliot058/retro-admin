import { Application } from '../declarations';
import v1 from './v1';

import v1ChatAllGroups from './v1/chat/all-groups/all-groups.service';

// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
    app.configure(v1);
    app.configure(v1ChatAllGroups);
}
