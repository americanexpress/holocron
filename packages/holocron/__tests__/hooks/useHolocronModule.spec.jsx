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

/* eslint-disable react/prop-types, import/no-extraneous-dependencies  */
import React from 'react';
import { fromJS } from 'immutable';

import { useDispatch } from 'react-redux';
import useHolocronModule, { HolocronModule, useHolocronModuleContext } from '../../src/hooks/useHolocronModule';
import { Holocron } from '../../src/hooks/useHolocron';

import { render, act, waitFor } from '../__util__/renderer';

jest.mock('../../src/loadModule.web', () => ({ default: () => Promise.resolve(() => null) }));

beforeEach(() => {
  jest.clearAllMocks();
});

beforeAll(() => {
  jest.spyOn(console, 'assert').mockImplementation();
  jest.spyOn(console, 'dir').mockImplementation();
  // jest.spyOn(console, 'debug').mockImplementation();
});

const TestModuleContext = () => {
  const {
    moduleLoadStatus, moduleState, moduleData, moduleConfig, holocronState, loadModuleData,
  } = useHolocronModuleContext();
  return (
    <p>
      {JSON.stringify({
        moduleLoadStatus, moduleState, moduleData, moduleConfig, holocronState, loadModuleData,
      })}
    </p>
  );
};

const TestModule = ({
  moduleLoadStatus, moduleState, moduleData, moduleConfig, holocronState, loadModuleData,
}) => (
  <p>
    {JSON.stringify({
      moduleLoadStatus, moduleState, moduleData, moduleConfig, holocronState, loadModuleData,
    })}
  </p>
);

describe(useHolocronModule.name, () => {
  const TestUseHolocronModule = ({ children }) => {
    const HolocronModuleContainer = useHolocronModule();
    return (
      <HolocronModuleContainer>
        {children}
      </HolocronModuleContainer>
    );
  };

  test('uses holocron context in sub component to access module state', async () => {
    expect(render((
      <Holocron>
        <TestUseHolocronModule>
          <TestModuleContext />
        </TestUseHolocronModule>
      </Holocron>
    )).asFragment()).toMatchSnapshot();
  });
});

describe(HolocronModule.name, () => {
  const moduleMetaData = { browser: { url: 'https://example.com/modules/module.js' } };

  beforeAll(() => {
    global.BROWSER = true;
  });

  test('attempts to load up module data without "loadModuleData"', async () => {
    const loadModuleData = jest.fn();
    const Module = ({ children, ...props }) => React.cloneElement(children, props);

    let result;
    await act(async () => {
      result = render(
        <Holocron
          holocronModules={{ Module }}
        >
          <HolocronModule
            name="Module"
            moduleMetaData={moduleMetaData}
          >
            <TestModule />
          </HolocronModule>
        </Holocron>
      );
      await waitFor(() => result.findByText(/"moduleLoadStatus":"loaded"/));
    });

    expect(loadModuleData).toHaveBeenCalledTimes(0);
    expect(result.asFragment()).toMatchSnapshot();
  });

  test('fails to load up module data using "loadModuleData"', async () => {
    const loadModuleData = jest.fn();
    const Module = ({ children, ...props }) => React.cloneElement(children, props);

    loadModuleData.mockImplementationOnce(() => Promise.reject());

    let result;
    await act(async () => {
      result = render(
        <Holocron
          holocronModules={{ Module }}
        >
          <HolocronModule
            name="Module"
            loadModuleData={loadModuleData}
            moduleMetaData={moduleMetaData}
          >
            <TestModule />
          </HolocronModule>
        </Holocron>
      );
      await waitFor(() => result.findByText(/"moduleLoadStatus":"error"/));
    });

    expect(loadModuleData).toHaveBeenCalledTimes(1);
    expect(result.asFragment()).toMatchSnapshot();
  });

  test('loads up module data with "loadModuleData"', async () => {
    const loadModuleData = jest.fn();
    const Module = ({ children, ...props }) => React.cloneElement(children, props);

    let result;
    await act(async () => {
      result = render(
        <Holocron
          holocronModules={{ Module }}
        >
          <HolocronModule
            name="Module"
            moduleMetaData={moduleMetaData}
            loadModuleData={loadModuleData}
          >
            <TestModule />
          </HolocronModule>
        </Holocron>
      );
      await waitFor(() => result.findByText(/"moduleLoadStatus":"loaded"/));
    });

    expect(loadModuleData).toHaveBeenCalledTimes(1);
    expect(result.asFragment()).toMatchSnapshot();
  });

  test('using a reducer supplied to a module', async () => {
    const reducer = jest.fn((state = fromJS({ count: 0 }), action) => {
      if (action.type === 'increment') return state.update('count', (current) => current + 1);
      return state;
    });
    reducer.buildInitialState = () => fromJS({ count: 1 });
    const increment = () => ({ type: 'increment' });
    const TestReduxReducer = () => {
      const dispatch = useDispatch();
      React.useEffect(() => {
        dispatch(increment());
      }, []);
      return null;
    };
    let result;
    await act(async () => {
      result = render(
        <Holocron>
          <HolocronModule
            reducer={reducer}
            initialState={fromJS({ count: 1 })}
          >
            <TestModule />
            <TestModuleContext />
            {/* <TestReduxReducer /> */}
          </HolocronModule>
        </Holocron>
      );
    });

    await act(async () => {
      await waitFor(() => result.findByText(/"isReducerLoaded":"module"/));
    });

    expect(result.asFragment()).toMatchSnapshot();
  });
});
