/* eslint-disable no-underscore-dangle */
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

import React from 'react';

import { render } from '../__util__/renderer';
import useHolocron, { useHolocronContext, Holocron } from '../../src/hooks/useHolocron';

describe(useHolocron.name, () => {
  // eslint-disable-next-line react/prop-types
  function TestHolocronHook({ children, ...options }) {
    const HolocronContainer = useHolocron(options);
    return (
      <HolocronContainer>
        {children}
      </HolocronContainer>
    );
  }
  function TestHolocronContext() {
    const { store, registry } = useHolocronContext();
    return (
      <React.Fragment>
        <p>{JSON.stringify(store.getState().toJS())}</p>
        <p>{JSON.stringify(registry)}</p>
      </React.Fragment>
    );
  }
  function TestHolocronGetContext() {
    const HolocronContainer = useHolocron();
    const { store, registry } = HolocronContainer.getContext();

    return (
      <React.Fragment>
        <p>{JSON.stringify(store)}</p>
        <p>{JSON.stringify(registry)}</p>
      </React.Fragment>
    );
  }

  test('passes context with store and registry', () => {
    expect(render(
      <TestHolocronHook>
        <TestHolocronContext />
      </TestHolocronHook>
    ).asFragment()).toMatchSnapshot();
  });

  test('gets holocron context from hook returning component', () => {
    expect(render(
      <TestHolocronGetContext />
    ).asFragment()).toMatchSnapshot();
  });

  describe(Holocron.name, () => {
    test('passes context with store and registry', () => {
      expect(render(
        <Holocron>
          <TestHolocronContext />
        </Holocron>
      ).asFragment()).toMatchSnapshot();
    });
  });
});
