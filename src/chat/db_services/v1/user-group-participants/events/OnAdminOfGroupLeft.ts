/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 1:32 PM.
 */
import { UserGroupParticipant_GET, UserGroupParticipantStatus } from '../interfaces/UserGroupParticipantInterface';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { userGroupParticipantsPath } from '../../../../service_endpoints/services';
import { GroupPermission_GET } from '../../group-permissions/interfaces/GroupPermissionInterface';

/**
 * On only admin left the group make another user admin of that group.
 * @param result
 * @param context
 * @constructor
 */
const OnAdminOfGroupLeft = async (result: UserGroupParticipant_GET, context: HookContext) => {
    const { app, data, method, params } = context;
    const { participant, permissions } = result;
    const { user } = params;

    if (method === 'patch') {
        if (!data.status || data.status !== UserGroupParticipantStatus.LEFT) return context;
    }

    if (!user) return context;

    // Define the services.
    const userGroupParticipantService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);

    // Check if the participant was an admin.
    let isUserAdmin = false;
    let adminPermissionId = '';
    for (const each of permissions) {
        const permissionData = each as GroupPermission_GET;
        if (permissionData.metaName === 'admin_group') {
            isUserAdmin = true;
            adminPermissionId = permissionData._id.toString();
            break;
        }
    }
    if (!isUserAdmin) {
        return context;
    }

    const otherGroupParticipants: Array<UserGroupParticipant_GET> = await userGroupParticipantService._find({
        query: {
            status: UserGroupParticipantStatus.ACTIVE,
            $select: ['participant', 'permissions'],
            participant: {
                $ne: participant._id,
            },
            $sort: {
                createdAt: 1,
            },
        },
        paginate: false,
    });

    let otherAdminParticipantExists = false;
    for (const each of otherGroupParticipants) {
        const { permissions: permissionsForParticipant } = each;
        if (permissionsForParticipant.map((e) => e.toString()).includes(adminPermissionId)) {
            otherAdminParticipantExists = true;
            break;
        }
    }
    if (!otherAdminParticipantExists) {
        await userGroupParticipantService.patch(
            otherGroupParticipants[0]._id.toString(),
            {
                permissions,
            },
            {
                ...params,
                query: {
                    ...params?.query,
                    $populate: [
                        {
                            path: 'permissions',
                        },
                        {
                            path: 'participant',
                        },
                        {
                            path: 'group',
                            populate: ['parentId'],
                        },
                    ],
                },
                user: params?.user,
                provider: 'server',
            },
        );
    }
};

export default OnAdminOfGroupLeft;
