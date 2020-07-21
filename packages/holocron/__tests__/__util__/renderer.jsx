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
