const dotenv = require('dotenv');
const withCSS = require('@zeit/next-css');

const EXPOSED_ENVS = [
  'APP_NAME',
];

dotenv.config();

module.exports = withCSS({
  webpack: (config) => {
    const customConfig = { ...config };

    customConfig.resolve.alias = { ...config.resolve.alias, '@app': __dirname };

    return customConfig;
  },
  env: EXPOSED_ENVS.reduce((obj, env) => ({
    ...obj,
    [env]: process.env[env],
  }), {}),
});
