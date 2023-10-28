/**
 * Created By Soumya(soumya@smarttersstudio.com) on 03-02-2022 at 13:35.
 */
import { HookContext } from '@feathersjs/feathers';
import { getItems, replaceItems } from 'feathers-hooks-common';

/**
 * @description set default value in data for respected field.
 * @param fieldName
 * @param defaultValue
 * @constructor
 */
const SetDefaultItem = (fieldName: string, defaultValue: any) => (context: HookContext) => {
    const items = getItems(context);

    if (Array.isArray(items)) {
        items.forEach((item) => {
            if (typeof item[fieldName] === 'undefined') item[fieldName] = defaultValue;
        });
    } else {
        if (typeof items[fieldName] === 'undefined') items[fieldName] = defaultValue;
    }

    replaceItems(context, items);

    return context;
};

export default SetDefaultItem;
