import publicHolocronModule from '../src/publicHolocronModule';

const warn = jest.spyOn(console, 'warn');

const holocronProperties = {
  name: 'MyModule',
  reducer: function fakeReducer() {},
  load: function fakeLoad() {},
  shouldModuleReload: function fakeShouldModuleReload() {},
  loadModuleData: function fakeLoadModuleData() {},
  mergeProps: function fakeMergeProps() {},
  options: function fakeOptions() {},
};

describe('publicHolocronModule', () => {
  it('should add holocron config properties as a static to wrapped component', () => {
    const FakeComponent = {
      name: 'FakeComponent',
      displayName: 'FakeComponent',
    };
    expect(publicHolocronModule({
      ...holocronProperties,
    })(FakeComponent)).toMatchSnapshot();
  });
  it('should add empty holocron config to wrapped component if no args are passed', () => {
    const FakeComponent = {
      name: 'FakeComponent',
      displayName: 'FakeComponent',
    };
    expect(publicHolocronModule()(FakeComponent)).toMatchSnapshot();
  });
  it('should send a deprecation warning if this publicHolocronModule is used', () => {
    const FakeComponent = {
      name: 'FakeComponent',
      displayName: 'FakeComponent',
    };
    publicHolocronModule()(FakeComponent);
    expect(warn.mock.calls[0][0]).toMatchSnapshot();
  });
});
