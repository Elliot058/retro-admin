import { Application } from '../../declarations';

import userManagement from './user-management/user-management.service';
// import userGroupManagement from './user-group-management/user-group-management.service';
import userGroupParticipantsManagement from './user-group-participants-management/user-group-participants-management.service';
import groupPermissionsManagement from './group-permissions-management/group-permissions-management.service';
import broadcastManagement from './broadcast-management/broadcast-management.service';

import searchUserGroup from './search-user-group/search-user-group.service';

import chat from './chat';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
    app.configure(userManagement);
    // app.configure(userGroupManagement);
    app.configure(userGroupParticipantsManagement);
    app.configure(groupPermissionsManagement);
    app.configure(broadcastManagement);

    app.configure(searchUserGroup);

    app.configure(chat);
}
