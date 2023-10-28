/**
 * Created By Soumya(soumya@smartters.in) on 1/16/2023 at 3:14 PM.
 */
import { Application, ServiceAddons } from '@feathersjs/feathers';
import { Service } from 'feathers-mongoose';
import { groupPermissionsPath } from '../../../../service_endpoints/services';
import { GroupPermission_GET } from '../interfaces/GroupPermissionInterface';

/**
 * Get all group permissions based on the query.
 * @param app
 * @param query
 */
const getAllGroupPermissions = async (app: Application, query: any) => {
    const groupPermissionService: Service & ServiceAddons<any> = app.service(groupPermissionsPath);
    return await groupPermissionService
        ._find({
            query: query,
            paginate: false,
        })
        .then((res: Array<GroupPermission_GET>) => res);
};

export default getAllGroupPermissions;
