import { Id, NullableId, Paginated, Params, ServiceAddons, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../../../declarations';
import { MessageStarred } from '../../../../db_services/v1/message-starred/message-starred.class';
import { messageStarredPath } from '../../../../service_endpoints/services';

interface Data {}

interface ServiceOptions {}

export class StarMessage implements ServiceMethods<Data> {
    app: Application;
    options: ServiceOptions;
    service: MessageStarred & ServiceAddons<any>;

    constructor(options: ServiceOptions = {}, app: Application) {
        this.options = options;
        this.app = app;
        this.service = app.service(messageStarredPath);
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
