import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mount } from 'enzyme';
import HolocronErrorBoundary, { withHolocronErrorBoundary } from '../src/HolocronErrorBoundary';

describe('HolocronErrorBoundary', () => {
  const { NODE_ENV } = process.env;

  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const mockError = new Error(
    'These are not the droids you are looking for.'
  );

    // eslint-disable-next-line react/prop-types
  const ChildOfModule = ({ throwError }) => {
    if (throwError) {
      throw mockError;
    }
    return <p>Error Free</p>;
  };

    // eslint-disable-next-line react/prop-types
  const Module = ({ throwError }) => (
    <div>
      <p>{`Should throw error: ${throwError}`}</p>
      <ChildOfModule throwError={throwError} />
    </div>
  );
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  afterEach(() => {
    process.env.NODE_ENV = NODE_ENV;
  });

  it('Renders the child component if there is no error', () => {
    const wrapper = mount(
      <HolocronErrorBoundary>
        <Module throwError={false} />
      </HolocronErrorBoundary>
    );

    const ModuleWithHolocronErrorBoundary = withHolocronErrorBoundary(Module);
    const wrapperWithHolocronErrorBoundary = mount(
      <ModuleWithHolocronErrorBoundary throwError={false} />
    );

    expect(wrapper.state().error).toBe(null);

    expect(
      wrapper.contains(<Module throwError={false} />)
    ).toBe(true);

    expect(
      wrapperWithHolocronErrorBoundary.find(HolocronErrorBoundary).instance().state.error
    ).toBe(null);

    expect(
      wrapperWithHolocronErrorBoundary.contains(
        <Module throwError={false} />
      )
    ).toBe(true);
  });

  it('Sets its state to an error state and renders the error message', () => {
    const wrapper = mount(
      <HolocronErrorBoundary>
        <Module throwError={true} />
      </HolocronErrorBoundary>
    );

    const ModuleWithHolocronErrorBoundary = withHolocronErrorBoundary(Module);
    const wrapperWithHolocronErrorBoundary = mount(
      <ModuleWithHolocronErrorBoundary throwError={true} />
    );

    expect(wrapper.state().error).toEqual(expect.objectContaining(mockError));
    expect(
      wrapperWithHolocronErrorBoundary.find(HolocronErrorBoundary).instance().state.error
    ).toEqual(expect.objectContaining(mockError));
    expect(
      wrapper.containsMatchingElement(
        <div>
          {mockError.message}
        </div>
      )
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Sets its state to an error state and renders null in production', () => {
    process.env.NODE_ENV = 'production';
    const wrapper = mount(
      <HolocronErrorBoundary>
        <Module throwError={true} />
      </HolocronErrorBoundary>
    );

    const ModuleWithHolocronErrorBoundary = withHolocronErrorBoundary(Module);
    const wrapperWithHolocronErrorBoundary = mount(
      <ModuleWithHolocronErrorBoundary throwError={true} />
    );

    expect(wrapper.state().error).toEqual(expect.objectContaining(mockError));
    expect(
      wrapperWithHolocronErrorBoundary.find(HolocronErrorBoundary).instance().state.error
    ).toEqual(expect.objectContaining(mockError));
    expect(
      wrapper.containsMatchingElement(
        <HolocronErrorBoundary />
      )
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Sets the correct displayName for the wrapped component', () => {
    function NormalModule() {
      return null;
    }

    expect(withHolocronErrorBoundary(NormalModule).displayName).toBe(
      'WithHolocronErrorBoundary(NormalModule)'
    );

    function ModuleWithDisplayNameOverride() {
      return null;
    }

    ModuleWithDisplayNameOverride.displayName = 'ModuleOverride';

    expect(
      withHolocronErrorBoundary(ModuleWithDisplayNameOverride).displayName
    ).toBe('WithHolocronErrorBoundary(ModuleOverride)');
    expect(withHolocronErrorBoundary(() => null).displayName).toBe('WithHolocronErrorBoundary');
  });
});
