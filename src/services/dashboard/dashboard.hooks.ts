import { HooksObject } from '@feathersjs/feathers';
import * as authentication from '@feathersjs/authentication';
// Don't remove this comment. It's needed to format import lines nicely.
import { disallow, discard, iff, isProvider } from 'feathers-hooks-common';
import FRequired from '../../../hooks/FRequired';

const { authenticate } = authentication.hooks;

export default {
  before: {
       all: [authenticate('jwt')],
        // find: [iff(isProvider('external'), disallow())],
        get: [iff(isProvider('external'), disallow())],
        create: [],
        update: [disallow()],
        patch: [iff(isProvider('external'), disallow())],
        remove: [iff(isProvider('external'), disallow())],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
