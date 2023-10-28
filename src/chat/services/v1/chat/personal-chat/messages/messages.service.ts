// Initializes the `v1/chat/personal-chat/messages` service on path `/v1/chat/personal-chat/messages`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../../declarations';
import { Messages } from './messages.class';
import hooks from './messages.hooks';
import multer from 'multer';
import { NextFunction, Request, Response } from 'express';

// Add this service to the service type index
declare module '../../../../../declarations' {
    interface ServiceTypes {
        'v1/chat/personal-chat/messages': Messages & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        paginate: app.get('paginate'),
        whitelist: ['$populate', '$regex', '$options'],
    };

    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    // Initialize our service with any options it requires
    app.use(
        '/v1/chat/personal-chat/messages',
        upload.any(),
        (req: Request, res: Response, next: NextFunction) => {
            req.body.files = req.files && req.files.length ? req.files : null;
            next();
        },
        new Messages(options, app),
    );

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/chat/personal-chat/messages');

    service.hooks(hooks);
}
