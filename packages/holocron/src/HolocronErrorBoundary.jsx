import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

class HolocronErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  // eslint-disable-next-line class-methods-use-this
  componentDidCatch(error, errorInfo) {
    console.error(error);
    console.error(errorInfo);
  }

  render() {
    const { props: { children }, state: { error } } = this;

    if (error) {
      if (process.env.NODE_ENV === 'production') return null;
      return <div style={{ color: 'red' }}>{error.message}</div>;
    }

    return (
      <Fragment>
        {children}
      </Fragment>
    );
  }
}

HolocronErrorBoundary.propTypes = {
  children: PropTypes.node,
};

HolocronErrorBoundary.defaultProps = {
  children: null,
};

export const withHolocronErrorBoundary = (WrappedComponent) => {
  const name = WrappedComponent.displayName || WrappedComponent.name;
  const Wrapped = props => (
    <HolocronErrorBoundary>
      <WrappedComponent {...props} />
    </HolocronErrorBoundary>
  );

  Wrapped.displayName = name
    ? `WithHolocronErrorBoundary(${name})`
    : 'WithHolocronErrorBoundary';

  return hoistNonReactStatics(Wrapped, WrappedComponent);
};

export default HolocronErrorBoundary;
