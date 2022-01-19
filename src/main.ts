import { App, pipelines, Stack } from 'aws-cdk-lib';
import { AppStage } from './app-stage';

const app = new App();
const pipelineStack = new Stack(app, 'HitsApi-Pipeline');

const pipeline = new pipelines.CodePipeline(pipelineStack, 'Pipeline', {
  synth: new pipelines.ShellStep('Synth', {
    input: pipelines.CodePipelineSource.connection('wheatstalk/cdk-hits-api', 'main', {
      connectionArn: `arn:aws:codestar-connections:ca-central-1:${pipelineStack.account}:connection/b3ea7f7b-0bf6-45eb-b5cb-792872e1aa4b`,
    }),
    commands: [
      'yarn install',
      'yarn build',
    ],
  }),

  selfMutation: true,
  publishAssetsInParallel: false,
  crossAccountKeys: true,
});

const productionStage = new AppStage(pipelineStack, 'HitsApi-Production');

pipeline.addStage(productionStage);

app.synth();