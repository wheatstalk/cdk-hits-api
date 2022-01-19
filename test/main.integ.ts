import { App, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { HitCounter, HitsTable } from '../src/hit-counter';

const app = new App();
const stack = new Stack(app, 'integ-main');

const table = new HitsTable(stack, 'Table', {
  removalPolicy: RemovalPolicy.DESTROY,
});

new HitCounter(stack, 'HitCounter', {
  table,
});

app.synth();