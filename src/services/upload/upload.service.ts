// Initializes the `v1/upload` service on path `/v1/upload`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { Upload } from './upload.class';
import createModel from './upload.model';
import multer from 'multer';
import hooks from './upload.hooks';
import { NextFunction, Request, Response } from 'express';

// Add this service to the service type index
declare module '../../../declarations' {
    interface ServiceTypes {
        'v1/upload': Upload & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate'),
        multi: true,
    };

    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    // Initialize our service with any options it requires
    app.use(
        '/v1/upload',
        upload.any(),
        (req: Request, res: Response, next: NextFunction) => {
            req.body.files = req.files && req.files.length ? req.files : null;
            next();
        },
        new Upload(options, app),
    );

    // Get our initialized service so that we can register hooks
    const service = app.service('v1/upload');

    service.hooks(hooks);
}
