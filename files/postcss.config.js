const tailwindcss = require('tailwindcss');

const autoprefixer = require('autoprefixer');

const whenProd = (processor) => process.env.NODE_ENV === 'production' && processor;

const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [
    './pages/**/*.js',
    './components/**/*.js',
    './node_modules/next/**/*.js',
  ],
  defaultExtractor: (content) => (content.match(/[\w-/:%]+(?<!:)/g) || []),
});

const cssnano = require('cssnano');

module.exports = {
  plugins: [
    tailwindcss,
    autoprefixer,
    whenProd(purgecss),
    whenProd(cssnano),
  ],
};
