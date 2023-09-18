import { match } from '@americanexpress/one-app-router';
import { composeModules } from 'holocron';

import { moduleRoutePrefetch } from '../../src/ducks/moduleRoutePrefetch';

jest.mock('@americanexpress/one-app-router', () => ({
  match: jest.fn((_, callback) => callback(null, null, {
    routes: [
      { moduleName: 'frank' },
      { component: 'not-a-frank' },
    ],
  })),
}));

jest.mock('holocron', () => ({
  composeModules: jest.fn(),
}));

const dispatch = jest.fn();

describe('moduleRoutePrefetch', () => {
  beforeEach(() => {
    dispatch.mockClear();
    composeModules.mockClear();
    match.mockClear();
  });

  it('returns a thunk', () => {
    const prefetchThunk = moduleRoutePrefetch({ routes: ['fake-route'], location: '/' });
    expect(prefetchThunk).toBeInstanceOf(Function);
  });

  it('calls match with given routes and location', async () => {
    const prefetchThunk = moduleRoutePrefetch({ routes: ['fake-route'], location: '/frank' });
    await prefetchThunk(dispatch);
    expect(match.mock.calls[0][0]).toEqual({ routes: ['fake-route'], location: '/frank' });
  });

  it('calls composeModules with only matched modules', async () => {
    const prefetchThunk = moduleRoutePrefetch({ routes: ['fake-route'], location: '/frank' });
    await prefetchThunk(dispatch);
    expect(composeModules.mock.calls[0][0]).toEqual([{ name: 'frank' }]);
  });

  it('rejects when match returns err', async () => {
    match.mockImplementationOnce((_, callback) => callback('match error'));
    const prefetchThunk = moduleRoutePrefetch({ routes: ['fake-route'], location: '/unkown' });
    await expect(prefetchThunk(dispatch)).rejects.toEqual('match error');
  });

  it('rejects when unable to match', async () => {
    match.mockImplementationOnce((_, callback) => callback(null, null, { /* no routes */}));
    const unableToMatchError = new Error(
      'Unable to prefetch modules for /unkown, ensure location is valid'
    );
    const prefetchThunk = moduleRoutePrefetch({ routes: ['fake-route'], location: '/unkown' });
    await expect(prefetchThunk(dispatch)).rejects.toEqual(unableToMatchError);
  });

  it('throws when no routes given', () => {
    expect(() => moduleRoutePrefetch({ location: '/unkown' })).toThrowErrorMatchingSnapshot();
  });

  it('throws when no location given', () => {
    expect(() => moduleRoutePrefetch({ routes: ['fake-route'] })).toThrowErrorMatchingSnapshot();
  });
});
