import { Id, NullableId, Paginated, Params, ServiceAddons, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../../../../declarations';
import { Service } from 'feathers-mongoose';
import { broadcastAccessPath } from '../../../../../service_endpoints/services';

interface Data {}

interface ServiceOptions {}

export class Access implements ServiceMethods<Data> {
    app: Application;
    options: ServiceOptions;
    service: Service & ServiceAddons<any>;

    constructor(options: ServiceOptions = {}, app: Application) {
        this.options = options;
        this.app = app;
        this.service = app.service(broadcastAccessPath);
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
        if (Array.isArray(data)) {
            return Promise.all(data.map((current) => this.create(current, params)));
        }

        return data;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
        return data;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
        return await this.service
            .patch(id, data, {
                ...params,
                provider: undefined,
            })
            .catch((e) => {
                throw e;
            });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async remove(id: NullableId, params?: Params): Promise<Data> {
        return { id };
    }
}
