import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mount } from 'enzyme';
import HolocronErrorBoundary, { withHolocronErrorBoundary } from '../src/HolocronErrorBoundary';

describe('HolocronErrorBoundary', () => {
  let consoleErrorSpy;
  let mockError;
  let CharacterWelcome;
  let Character;

  const { NODE_ENV } = process.env;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockError = new Error(
      'These are not the droids you are looking for.'
    );

    // eslint-disable-next-line react/prop-types
    Character = ({ name }) => {
      switch (name) {
        case 'R2-D2':
        case 'C-3PO':
        case 'BB-8':
          throw mockError;

        default:
          return <p>{`Welcome ${name}`}</p>;
      }
    };

    // eslint-disable-next-line react/prop-types
    CharacterWelcome = ({ name }) => (
      <div>
        <p>{`Looking up character ${name}`}</p>
        <Character name={name} />
      </div>
    );
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  afterEach(() => {
    process.env.NODE_ENV = NODE_ENV;
  });

  it('Renders the child component if there is no error', () => {
    const wrapper = mount(
      <HolocronErrorBoundary>
        <CharacterWelcome name="Chewbacca" />
      </HolocronErrorBoundary>
    );

    const CharacterWelcomeWithHolocronErrorBoundary = withHolocronErrorBoundary(CharacterWelcome);
    const wrapperWithHolocronErrorBoundary = mount(
      <CharacterWelcomeWithHolocronErrorBoundary name="Chewbacca" />
    );

    expect(wrapper.state().error).toBe(null);

    expect(
      wrapper.contains(<CharacterWelcome name="Chewbacca" />)
    ).toBe(true);

    expect(
      wrapperWithHolocronErrorBoundary.find(HolocronErrorBoundary).instance().state.error
    ).toBe(null);

    expect(
      wrapperWithHolocronErrorBoundary.contains(
        <CharacterWelcome name="Chewbacca" />
      )
    ).toBe(true);
  });

  it('Sets its state to an error state and renders the error message', () => {
    const wrapper = mount(
      <HolocronErrorBoundary>
        <CharacterWelcome name="R2-D2" />
      </HolocronErrorBoundary>
    );

    const CharacterWelcomeWithHolocronErrorBoundary = withHolocronErrorBoundary(CharacterWelcome);
    const wrapperWithHolocronErrorBoundary = mount(
      <CharacterWelcomeWithHolocronErrorBoundary name="R2-D2" />
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
        <CharacterWelcome name="C-3PO" />
      </HolocronErrorBoundary>
    );

    const CharacterWelcomeWithHolocronErrorBoundary = withHolocronErrorBoundary(CharacterWelcome);
    const wrapperWithHolocronErrorBoundary = mount(
      <CharacterWelcomeWithHolocronErrorBoundary name="C-3PO" />
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
