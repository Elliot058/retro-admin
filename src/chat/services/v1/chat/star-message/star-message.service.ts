// Initializes the `v1/chat/star-message` service on path `/v1/chat/star-message`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../declarations';
import { StarMessage } from './star-message.class';
import hooks from './star-message.hooks';

// Add this service to the service type index
declare module '../../../../declarations' {
  interface ServiceTypes {
    'v1/chat/star-message': StarMessage & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/v1/chat/star-message', new StarMessage(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('v1/chat/star-message');

  service.hooks(hooks);
}
