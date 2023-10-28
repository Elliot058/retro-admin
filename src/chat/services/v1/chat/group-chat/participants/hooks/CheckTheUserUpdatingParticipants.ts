/**
 * Created By Soumya(soumya@smartters.in) on 1/11/2023 at 8:42 AM.
 */
import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import {
    UserGroupParticipant_FIND,
    UserGroupParticipant_POST,
    UserGroupParticipant_QUERY,
    UserGroupParticipantStatus,
} from '../../../../../../db_services/v1/user-group-participants/interfaces/UserGroupParticipantInterface';
import { Service } from 'feathers-mongoose';
import { userGroupParticipantsPath } from '../../../../../../service_endpoints/services';
import { Forbidden } from '@feathersjs/errors';
import { Types } from 'mongoose';
import { GroupPermission_GET } from '../../../../../../db_services/v1/group-permissions/interfaces/GroupPermissionInterface';

/**
 * Check whether the user who is adding the participants must
 * be a group admin or group creator.
 * @constructor
 */
const CheckTheUserUpdatingParticipants = () => async (context: HookContext) => {
    const { app, method } = context;
    const {
        createdBy: participantCreatedBy,
        groupData,
        updatedBy: participantUpdatedBy,
    } = context.data as UserGroupParticipant_POST;
    if (groupData) {
        const checkUserAllowed = async (userId: Types.ObjectId) => {
            // Check if the participantCreatedBy is not creator of group
            // then validate the user must be a participant of the group
            // with admin permission.
            const userParticipantService: Service & ServiceAddons<any> = app.service(userGroupParticipantsPath);
            const query: UserGroupParticipant_QUERY = {
                participant: userId,
                group: groupData?._id,
                status: UserGroupParticipantStatus.ACTIVE,
            };
            const userParticipantData = await userParticipantService
                ._find({
                    query: {
                        ...query,
                        $limit: 1,
                        $populate: ['permissions'],
                    },
                })
                .then((res: UserGroupParticipant_FIND) => (res.total ? res.data[0] : null));
            if (!userParticipantData) {
                throw new Forbidden('You are not a participant in this group.');
            }

            // Check the user has admin permission or not.
            let isUserAdmin = false;
            for (const each of userParticipantData.permissions) {
                const permissionData = each as GroupPermission_GET;
                if (permissionData.metaName === 'admin_group' || permissionData.metaName === 'admin_channel') {
                    isUserAdmin = true;
                }
            }
            if (!isUserAdmin) {
                throw new Forbidden(
                    `You are not permitted to update participant in this ${groupData.parentId ? 'channel' : 'group'}.`,
                );
            }
            context.data.isUserAdmin = isUserAdmin;
        };

        if (method === 'create') {
            if (groupData.createdBy.toString() !== participantCreatedBy.toString()) {
                await checkUserAllowed(participantCreatedBy);
            }
        } else if (method === 'patch' && participantUpdatedBy) {
            if (groupData.createdBy.toString() !== participantUpdatedBy.toString()) {
                await checkUserAllowed(participantUpdatedBy);
            }
        }
    }
};

export default CheckTheUserUpdatingParticipants;
