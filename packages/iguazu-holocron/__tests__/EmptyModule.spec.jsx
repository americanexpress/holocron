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

import EmptyModule, { isEmpty, anyAreEmpty } from '../src/EmptyModule';

describe('EmptyModule', () => {
  it('should render null', () => {
    expect(EmptyModule()).toBeNull(); // eslint-disable-line new-cap
  });

  describe('isEmpty', () => {
    it('should return true if the Module is an instance of EmptyModule', () => {
      expect(isEmpty(EmptyModule)).toBe(true);
    });

    it('should return false if the Module is not an instance of EmptyModule', () => {
      const NotEmptyModule = () => null;
      expect(isEmpty(NotEmptyModule)).toBe(false);
    });
  });

  describe('anyAreEmpty', () => {
    it('should return true if at least one of the Modules is an instance of EmptyModule', () => {
      const NotEmptyModule = () => null;
      expect(anyAreEmpty(NotEmptyModule, EmptyModule, NotEmptyModule)).toBe(true);
    });

    it('should return false if none of the Modules is an instance of EmptyModule', () => {
      const NotEmptyModule = () => null;
      expect(anyAreEmpty(NotEmptyModule, NotEmptyModule, NotEmptyModule)).toBe(false);
    });
  });
});
