import React, {
  createContext, useState, useEffect, useContext,
} from 'react';
import PropTypes from 'prop-types';
import NProgress from 'nprogress';
import Router from 'next/router';

const Context = createContext();

const useProgressBar = () => useContext(Context);

const ProgressBar = ({ children }) => {
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const loading = () => setLoading(true);
    const ready = () => setLoading(false);

    Router.events.on('routeChangeStart', loading);
    Router.events.on('routeChangeComplete', ready);
    Router.events.on('routeChangeError', ready);

    return () => {
      Router.events.off('routeChangeStart', loading);
      Router.events.off('routeChangeComplete', ready);
      Router.events.off('routeChangeError', ready);
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isLoading]);

  return (
    <Context.Provider value={[setLoading]}>
      {children}
    </Context.Provider>
  );
};

ProgressBar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProgressBar;

export { useProgressBar };
