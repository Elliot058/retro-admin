import { BadRequest } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';

/**
 * @description validate the given id according to the referred service.
 * @param serviceName
 * @param key
 * @param query
 * @constructor
 */
const ModuleValidateData =
    (serviceName: string, key: string, query: any = {}) =>
    async (context: HookContext) => {
        const { data, app } = context;

        if (!query) query.status = { $ne: -1 };

        const service = app.service(serviceName);

        const check = async (each: { [x: string]: any }) => {
            let id = each[key];

            if (!id) return;

            //console.log(id);

            if (!Array.isArray(id)) id = [id];

            each[`${key}Data`] = [];

            for (let i = 0; i < id.length; i++) {
                const result = await service._get(id[i], { query }).catch(() => null);

                //console.log(result);

                if (!result) throw new BadRequest(`Invalid value of ${key}`);

                each[`${key}Data`].push(result);
            }

            // console.log(each[`${key}Data`]);
            //
            if (each[`${key}Data`].length === 1) each[`${key}Data`] = each[`${key}Data`][0];
        };

        if (Array.isArray(data)) {
            for (const each of data) {
                await check(each);
            }
        } else {
            await check(data);
            // console.log(data);
        }

        return context;
    };

export default ModuleValidateData;
