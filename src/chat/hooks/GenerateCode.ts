import { customAlphabet } from 'nanoid';
import { HookContext } from '@feathersjs/feathers';

/**
 * @description generate custom code.
 * @param serviceName
 * @param prefix
 * @param key
 * @param size
 * @returns {(function(*): Promise<void>)|*}
 * @constructor
 */
const GenerateCode =
    (serviceName: string, prefix: string, key: string, size: number) => async (context: HookContext) => {
        const { data, app } = context;

        const service = app.service(`${serviceName}`);

        let code;
        let codeExists = true;

        while (codeExists) {
            const nanoid = customAlphabet('0123456789', size);
            code = nanoid();

            const query: any = {};
            query[key] = `${prefix}${code}`;

            codeExists = await service
                ._find({
                    query,
                })
                .then((res: any) => !!res.total);
        }

        data[key] = `${prefix}${code}`;
    };

export default GenerateCode;
