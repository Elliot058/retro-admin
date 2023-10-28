// Initializes the `v1/chat/react-message` service on path `/v1/chat/react-message`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../../declarations';
import { ReactMessage } from './react-message.class';
import hooks from './react-message.hooks';

// Add this service to the service type index
declare module '../../../../declarations' {
  interface ServiceTypes {
    'v1/chat/react-message': ReactMessage & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/v1/chat/react-message', new ReactMessage(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('v1/chat/react-message');

  service.hooks(hooks);
}
