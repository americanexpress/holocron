/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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

// test-utils.js
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from '@testing-library/react';

import { Holocron } from '../../src/hooks/useHolocron';

export const HolocronWrapper = ({
  // eslint-disable-next-line react/prop-types
  children, reducer, initialState, holocronModuleMap, modules,
} = {}) => (
  <Holocron
    reducer={reducer}
    initialState={initialState}
    holocronModuleMap={holocronModuleMap}
    modules={modules}
  >
    {typeof children === 'function' ? children() : children}
  </Holocron>
);

const customRender = (children, { wrap, ...options } = {}) => render(
  children,
  { wrapper: wrap && HolocronWrapper, ...options }
);

// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';
export { customRender as render };
