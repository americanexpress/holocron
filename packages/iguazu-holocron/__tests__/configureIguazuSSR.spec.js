/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

import { iguazuReduce } from 'iguazu';
import configureIguazuSSR from '../src/configureIguazuSSR';

jest.mock('iguazu', () => ({
  iguazuReduce: jest.fn(),
}));

const store = { dispatch: jest.fn(), getState: jest.fn() };
const fakeModule = { loadDataAsProps: jest.fn() };

describe('configureIguazuSSR', () => {
  beforeEach(() => jest.resetAllMocks());
  it('should return a promise', () => {
    iguazuReduce.mockImplementationOnce(() => () => ({ promise: Promise.resolve() }));
    expect(configureIguazuSSR({ store, module: fakeModule, ownProps: {} })).toBeInstanceOf(Promise);
  });
  it('should call iguazuReduce', () => {
    iguazuReduce.mockImplementationOnce(() => () => ({ promise: Promise.resolve() }));
    configureIguazuSSR({ store, module: fakeModule, ownProps: {} });
    expect(iguazuReduce).toHaveBeenCalled();
  });
  it('should not call iguazuReduce if global.BROWSER', () => {
    global.BROWSER = true;
    configureIguazuSSR({ store, module: fakeModule, ownProps: {} });
  });
});
