/* eslint react/jsx-props-no-spreading: 0 */
import React from 'react';
import App from 'next/app';
import '@app/public/app.css';
import ProgressBar from '@app/services/ProgressBar';

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    return (
      <ProgressBar>
        <Component {...pageProps} />
      </ProgressBar>
    );
  }
}

export default MyApp;
