import app from '../../src/app';

describe('\'data-tables\' service', () => {
  it('registered the service', () => {
    const service = app.service('data-tables');
    expect(service).toBeTruthy();
  });
});
