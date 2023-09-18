import publicHolocronModule from '../src/publicHolocronModule';

const warn = jest.spyOn(console, 'warn');

const holocronProperties = {
  name: 'MyModule',
  reducer: function fakeReducer() {},
  load: function fakeLoad() {},
  shouldModuleReload: function fakeShouldModuleReload() {},
  loadModuleData: function fakeLoadModuleData() {},
  mergeProps: function fakeMergeProperties() {},
  options: function fakeOptions() {},
};

describe('publicHolocronModule', () => {
  it('should add holocron config properties to component', () => {
    const FakeComponent = {
      name: 'FakeComponent',
      displayName: 'FakeComponent',
    };
    expect(publicHolocronModule({
      ...holocronProperties,
    })(FakeComponent)).toMatchSnapshot();
  });

  it('should attach empty holocron config to component without args', () => {
    const FakeComponent = {
      name: 'FakeComponent',
      displayName: 'FakeComponent',
    };
    expect(publicHolocronModule()(FakeComponent)).toMatchSnapshot();
  });

  it('should send a deprecation warning', () => {
    const FakeComponent = {
      name: 'FakeComponent',
      displayName: 'FakeComponent',
    };
    publicHolocronModule()(FakeComponent);
    expect(warn).toHaveBeenCalled();
  });
});
