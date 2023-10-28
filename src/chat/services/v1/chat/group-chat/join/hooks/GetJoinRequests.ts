/**
 * Created By Soumya(soumya@smartters.in) on 1/24/2023 at 3:30 PM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { User_GET, UserRole } from '../../../../../../db_services/v1/user/interfaces/UserInterfaces';
import { UserGroupParticipants } from '../../../../../../db_services/v1/user-group-participants/user-group-participants.class';
import { groupPermissionsPath, userGroupParticipantsPath } from '../../../../../../service_endpoints/services';
import {
    UserGroupParticipant_GET,
    UserGroupParticipant_QUERY,
    UserGroupParticipantStatus,
} from '../../../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import { GroupPermissions } from '../../../../../../db_services/v1/group-permissions/group-permissions.class';
import {
    GroupPermission_FIND,
    GroupPermissionStatus,
} from '../../../../../../db_services/v1/group-permissions/interfaces/GroupPermissionInterface';
import { BadRequest } from '@feathersjs/errors';

/**
 * Get all join requests for groups.
 * @constructor
 */
const GetJoinRequests = () => async (context: HookContext) => {
    const { params, app } = context;
    const { user, query } = params;
    if (!user || !query) return context;

    const userData = user as User_GET;

    const userGroupParticipantService: UserGroupParticipants & ServiceAddons<any> =
        app.service(userGroupParticipantsPath);
    const groupPermissionService: GroupPermissions & ServiceAddons<any> = app.service(groupPermissionsPath);

    if (userData.role === UserRole.USER) {
        const adminGroupPermission = await groupPermissionService
            ._find({
                query: {
                    status: GroupPermissionStatus.ACTIVE,
                    metaName: 'admin_group',
                    $limit: 1,
                },
            })
            .then((res: GroupPermission_FIND) => (res.total ? res.data[0]._id : null));
        if (adminGroupPermission) {
            const groups = await userGroupParticipantService
                ._find({
                    query: {
                        permissions: {
                            $in: [adminGroupPermission],
                        },
                        $select: ['group'],
                        group: query.group ? query.group : { $ne: null },
                        participant: userData._id,
                    },
                    paginate: false,
                })
                .then((res: Array<UserGroupParticipant_GET>) => res.map((e) => e.group.toString()));
            if (!groups.length) {
                // context.result = {
                //     total: 0,
                //     limit: query.$limit || 10,
                //     skip: query.$skip || 0,
                //     data: [],
                // };
                // return context;
                throw new BadRequest('You are not an admin to accept or reject join requests from the groups.');
            }
            query.group = {
                $in: groups,
            };
        }
    }

    const userGroupParticipantQuery: UserGroupParticipant_QUERY = {
        status: UserGroupParticipantStatus.REQUESTED,
        group: query.group ? query.group : { $ne: null },
    };

    context.result = await userGroupParticipantService._find({
        query: {
            ...userGroupParticipantQuery,
            $limit: query.$limit || 10,
            $skip: query.$skip || 0,
            $populate: [
                {
                    path: 'group',
                    select: ['_id', 'name', 'avatar', 'description', 'memberCount'],
                },
                {
                    path: 'participant',
                    select: ['_id', 'name', 'avatar', 'bio'],
                },
            ],
        },
    });
};

export default GetJoinRequests;
