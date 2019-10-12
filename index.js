const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const validatePackageName = require('validate-npm-package-name');
const slug = require('slug');
const path = require('path');
const os = require('os');
const spawn = require('cross-spawn');

const { log } = console;

log(chalk.green.bold(`
███╗   ██╗███████╗██╗  ██╗████████╗     ██╗███████╗
████╗  ██║██╔════╝╚██╗██╔╝╚══██╔══╝     ██║██╔════╝
██╔██╗ ██║█████╗   ╚███╔╝    ██║        ██║███████╗
██║╚██╗██║██╔══╝   ██╔██╗    ██║   ██   ██║╚════██║
██║ ╚████║███████╗██╔╝ ██╗   ██║██╗╚█████╔╝███████║
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝   ╚═╝╚═╝ ╚════╝ ╚══════╝

The ultimate Next.js Stack Generator
`));

const BASE_PACKAGES = [
  'react',
  'react-dom',
  'next',
  '@babel/plugin-proposal-nullish-coalescing-operator',
  '@babel/plugin-proposal-optional-chaining',
  'babel-eslint',
  'dotenv',
  'eslint',
  'eslint-config-airbnb',
  'eslint-plugin-import',
  'eslint-plugin-jsx-a11y',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'prop-types',
  'nprogress',
];

const performSetup = (answers) => {
  const originalDirectory = process.cwd();
  const root = path.resolve(answers.project_slug);

  fs.ensureDirSync(root);

  const packageJson = {
    name: answers.project_slug,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'next',
      build: 'next build',
      start: 'next start',
      lint: 'eslint "**/*.js"',
    },
  };

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL,
  );

  process.chdir(root);

  const args = ['add'];

  if (answers.uses_contentful) {
    args.push(['contentful']);
  }

  if (answers.uses_tailwind) {
    args.push([
      'autoprefixer',
      'cssnano',
      'tailwindcss',
      '@zeit/next-css',
      '@fullhuman/postcss-purgecss',
    ]);
  }

  args.push(BASE_PACKAGES);

  log(chalk.cyan.bold('\n[*] Installing dependencies, this may take a few minutes...\n'));

  spawn.sync('npm', args.flat(), { stdio: 'inherit' });

  log(chalk.cyan.bold('[*] Copying over required files based on project configuration...\n'));

  fs.copySync(
    path.resolve(originalDirectory, 'files'),
    path.resolve(root),
    {
      filter(src) {
        // Skip configuration specific files.
        return !path.basename(src).startsWith('_');
      },
    },
  );

  if (answers.uses_contentful && answers.uses_tailwind) {
    fs.copySync(
      path.resolve(originalDirectory, 'files', '_cms_tw_next.config.js'),
      path.resolve(root, 'next.config.js'),
    );
  } else if (answers.uses_contentful) {
    fs.copySync(
      path.resolve(originalDirectory, 'files', '_cms_next.config.js'),
      path.resolve(root, 'next.config.js'),
    );
  } else if (answers.uses_tailwind) {
    fs.copySync(
      path.resolve(originalDirectory, 'files', '_tw_next.config.js'),
      path.resolve(root, 'next.config.js'),
    );
  } else {
    fs.copySync(
      path.resolve(originalDirectory, 'files', '_next.config.js'),
      path.resolve(root, 'next.config.js'),
    );
  }
};

inquirer
  .prompt([
    {
      type: 'input',
      name: 'project_name',
      message: () => 'What is the application name (e.g.: Swedish Elk)?',
      validate: (name) => (name.length > 0 ? true : 'Please provide a valid project name'),
    },
    {
      type: 'input',
      name: 'project_slug',
      message: () => 'What should the package name be?',
      default: (answers) => slug(answers.project_name, { lower: true }),
      validate: (projectSlug) => {
        const { validForNewPackages } = validatePackageName(projectSlug);

        if (!validForNewPackages) {
          return 'Please provide a valid package name';
        }

        return validForNewPackages;
      },
    },
    {
      type: 'confirm',
      name: 'uses_contentful',
      message: () => 'Will this project be using Contentful?',
    },
    {
      type: 'confirm',
      name: 'uses_tailwind',
      message: () => 'Will this project be using Tailwind CSS?',
    },
  ])
  .then(performSetup);
