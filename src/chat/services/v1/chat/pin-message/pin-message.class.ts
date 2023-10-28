import { Id, NullableId, Paginated, Params, ServiceAddons, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../../../declarations';
import { messagePinnedPath } from '../../../../service_endpoints/services';
import { Service } from 'feathers-mongoose';

interface Data {}

interface ServiceOptions {}

export class PinMessage implements ServiceMethods<Data> {
    app: Application;
    options: ServiceOptions;
    service: Service & ServiceAddons<any>;

    constructor(options: ServiceOptions = {}, app: Application) {
        this.options = options;
        this.app = app;
        this.service = app.service(messagePinnedPath);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async find(params?: Params): Promise<Data[] | Paginated<Data>> {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async get(id: Id, params?: Params): Promise<Data> {
        return {
            id,
            text: `A new message with ID: ${id}!`,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async create(data: Data, params?: Params): Promise<Data> {
        return await this.service.create(data, {
            ...params,
            provider: undefined,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
        return data;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
        return data;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async remove(id: NullableId, params?: Params): Promise<Data> {
        return await this.service.remove(id, {
            ...params,
            provider: undefined,
        });
    }
}
