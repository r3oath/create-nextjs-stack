import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';

const buildTitle = (path = []) => [...path, process.env.APP_NAME].join(' | ');

const Meta = ({ children, details }) => (
  <>
    <Head>
      <title>{buildTitle(details.title)}</title>
      <meta name="description" content={details.description} />
    </Head>
    {children}
  </>
);

Meta.propTypes = {
  children: PropTypes.node.isRequired,
  details: PropTypes.shape({
    title: PropTypes.array.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
};

export default Meta;
