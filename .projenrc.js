const { awscdk } = require('projen');
const cdkVersion = '2.8.0';
const project = new awscdk.AwsCdkTypeScriptApp({
  author: 'Josh Kellendonk',
  authorAddress: 'joshkellendonk@gmail.com',
  cdkVersion: cdkVersion,
  defaultReleaseBranch: 'main',
  name: '@wheatstalk/cdk-hits-api',
  repositoryUrl: 'https://github.com/wheatstalk/cdk-hits-api.git',

  projenTokenSecret: 'YARN_UPGRADE_TOKEN',
  autoApproveUpgrades: true,
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['github-actions', 'github-actions[bot]', 'misterjoshua'],
  },

  workflowNodeVersion: '14',

  deps: [
    'cdk-watchful',
    `@aws-cdk/aws-apigatewayv2-alpha@${cdkVersion}-alpha.0`,
    `@aws-cdk/aws-apigatewayv2-integrations-alpha@${cdkVersion}-alpha.0`,
    'aws-sdk',
  ],

  devDeps: [
    '@types/aws-lambda',
  ],

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

project.upgradeWorkflow?.postUpgradeTask.spawn(
  project.tasks.tryFind('integ:main:snapshot'),
);

project.synth();