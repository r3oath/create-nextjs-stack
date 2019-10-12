#!/usr/bin/env node

const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const validatePackageName = require('validate-npm-package-name');
const slug = require('slug');
const path = require('path');
const os = require('os');
const spawn = require('cross-spawn');
const Twig = require('twig');

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

  if (answers.use_contentful) {
    args.push(['contentful']);
  }

  if (answers.use_tailwind) {
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

  log(chalk.cyan.bold('[*] Setting up project directories...'));

  fs.outputFileSync(path.resolve(root, 'components', '.gitkeep'), '');
  fs.outputFileSync(path.resolve(root, 'layouts', '.gitkeep'), '');
  fs.outputFileSync(path.resolve(root, 'integrations', '.gitkeep'), '');
  fs.outputFileSync(path.resolve(root, 'pages', '.gitkeep'), '');
  fs.outputFileSync(path.resolve(root, 'public', '.gitkeep'), '');
  fs.outputFileSync(path.resolve(root, 'services', '.gitkeep'), '');
  fs.outputFileSync(path.resolve(root, 'utils', '.gitkeep'), '');

  log(chalk.cyan.bold('[*] Creating project files and configuration...'));

  fs.copySync(
    path.resolve(originalDirectory, 'files', 'common'),
    path.resolve(root),
  );

  fs.copySync(
    path.resolve(originalDirectory, 'files', 'services'),
    path.resolve(root, 'services'),
  );

  if (answers.use_zeit_now) {
    fs.copySync(
      path.resolve(originalDirectory, 'files', 'utils'),
      path.resolve(root, 'utils'),
    );
  }

  if (answers.use_tailwind) {
    fs.copySync(
      path.resolve(originalDirectory, 'files', 'tailwind'),
      path.resolve(root),
    );
  }

  if (answers.use_contentful) {
    fs.copySync(
      path.resolve(originalDirectory, 'files', 'integrations', 'contentful.js'),
      path.resolve(root, 'integrations', 'contentful.js'),
    );
  }

  const twigProps = {
    name: answers.project_name,
    slug: answers.project_slug,
    tailwind: answers.use_tailwind,
    contentful: answers.use_contentful,
    zeitNow: answers.use_zeit_now,
  };

  Twig.renderFile(
    path.resolve(originalDirectory, 'files', 'next.config.js.twig'),
    twigProps,
    (err, output) => {
      if (err) {
        log(chalk.red.bold(err));
        process.exit(1);
      }

      fs.outputFileSync(path.resolve(root, 'next.config.js'), output);
    },
  );

  Twig.renderFile(
    path.resolve(originalDirectory, 'files', 'public', 'app.css.twig'),
    twigProps,
    (err, output) => {
      if (err) {
        log(chalk.red.bold(err));
        process.exit(1);
      }

      fs.outputFileSync(path.resolve(root, 'public', 'app.css'), output);
    },
  );

  Twig.renderFile(
    path.resolve(originalDirectory, 'files', 'pages', '_app.js.twig'),
    twigProps,
    (err, output) => {
      if (err) {
        log(chalk.red.bold(err));
        process.exit(1);
      }

      fs.outputFileSync(path.resolve(root, 'pages', '_app.js'), output);
    },
  );

  Twig.renderFile(
    path.resolve(originalDirectory, 'files', 'pages', '_document.js.twig'),
    twigProps,
    (err, output) => {
      if (err) {
        log(chalk.red.bold(err));
        process.exit(1);
      }

      fs.outputFileSync(path.resolve(root, 'pages', '_document.js'), output);
    },
  );

  Twig.renderFile(
    path.resolve(originalDirectory, 'files', 'pages', 'index.js.twig'),
    twigProps,
    (err, output) => {
      if (err) {
        log(chalk.red.bold(err));
        process.exit(1);
      }

      fs.outputFileSync(path.resolve(root, 'pages', 'index.js'), output);
    },
  );

  Twig.renderFile(
    path.resolve(originalDirectory, 'files', '.env.example.twig'),
    twigProps,
    (err, output) => {
      if (err) {
        log(chalk.red.bold(err));
        process.exit(1);
      }

      fs.outputFileSync(path.resolve(root, '.env.example'), output);
      fs.copySync(path.resolve(root, '.env.example'), path.resolve(root, '.env'));
    },
  );

  if (answers.use_zeit_now) {
    Twig.renderFile(
      path.resolve(originalDirectory, 'files', 'now.json.twig'),
      twigProps,
      (err, output) => {
        if (err) {
          log(chalk.red.bold(err));
          process.exit(1);
        }

        fs.outputFileSync(path.resolve(root, 'now.json'), output);
      },
    );
  }

  log(chalk.green.bold(`
██████╗ ███████╗ █████╗ ██████╗ ██╗   ██╗██╗
██╔══██╗██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝██║
██████╔╝█████╗  ███████║██║  ██║ ╚████╔╝ ██║
██╔══██╗██╔══╝  ██╔══██║██║  ██║  ╚██╔╝  ╚═╝
██║  ██║███████╗██║  ██║██████╔╝   ██║   ██╗
╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝   ╚═╝
  `));

  log('Move into your project directory\n');
  log(chalk.magenta.bold(`cd ${answers.project_slug}`));

  if (answers.use_contentful) {
    log('\nUpdate the following environment variables in your .env file');
    log(chalk.magenta.bold(`
CONTENTFUL_HOST_URL
CONTENTFUL_SPACE_ID
CONTENTFUL_API_KEY
    `));
  }

  log('And start the application 🚀\n');
  log(chalk.magenta.bold('npm run dev'));
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
      name: 'use_contentful',
      message: () => 'Will this project be using Contentful?',
    },
    {
      type: 'confirm',
      name: 'use_tailwind',
      message: () => 'Will this project be using Tailwind CSS?',
    },
    {
      type: 'confirm',
      name: 'use_zeit_now',
      message: () => 'Will this project be deployed with Zeit Now?',
    },
  ])
  .then(performSetup);
