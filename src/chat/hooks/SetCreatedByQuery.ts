/**
 * Created By Soumya(soumya@smarttersstudio.com) on 03-02-2022 at 15:35.
 */
import { HookContext } from '@feathersjs/feathers';

/**
 * @description set createdBy field in query.
 * @constructor
 * @param _fieldNames
 */
const SetCreatedByQuery =
    (..._fieldNames: string[]) =>
    (context: HookContext) => {
        const { params } = context;

        const { user, query = {} } = params;

        if (!user) return context;

        const fieldNames = _fieldNames.length ? _fieldNames : ['user'];

        if (Array.isArray(fieldNames)) {
            fieldNames.map((each) => (query[each] = user._id));
        }
        return context;
    };

export default SetCreatedByQuery;
