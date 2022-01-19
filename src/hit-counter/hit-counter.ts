import * as aws_apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as aws_apigatewayv2_integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { aws_dynamodb, CfnOutput } from 'aws-cdk-lib';
import * as aws_lambda_nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as config from './config';

export interface HitCounterProps {
  readonly domainMapping?: aws_apigatewayv2.DomainMappingOptions;
  readonly table: aws_dynamodb.Table;
}

export class HitCounter extends Construct {
  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const { table, domainMapping } = props;

    const httpApi = new aws_apigatewayv2.HttpApi(this, 'HttpApi', {
      defaultDomainMapping: domainMapping,
      corsPreflight: {
        allowOrigins: ['*'],
        allowHeaders: ['*'],
        allowMethods: [aws_apigatewayv2.CorsHttpMethod.ANY],
      },
    });

    const hitCounterFunction = new HitsFunction(this, 'HitCounterFunction', { table });
    httpApi.addRoutes({
      methods: [aws_apigatewayv2.HttpMethod.GET],
      path: '/hits/{code}',
      integration: new aws_apigatewayv2_integrations.HttpLambdaIntegration('HitCounterFunction', hitCounterFunction),
    });

    const reportFunction = new HitsFunction(this, 'ReportFunction', { table });
    httpApi.addRoutes({
      methods: [aws_apigatewayv2.HttpMethod.GET],
      path: '/report',
      integration: new aws_apigatewayv2_integrations.HttpLambdaIntegration('ReportFunction', reportFunction),
    });

    if (httpApi.url) {
      new CfnOutput(this, 'HttpApiUrl', {
        value: httpApi.url,
      });
    }
  }
}

export interface HitsFunctionProps {
  readonly table: aws_dynamodb.ITable;
}

export class HitsFunction extends aws_lambda_nodejs.NodejsFunction {
  constructor(scope: Construct, id: string, props: HitsFunctionProps) {
    super(scope, id);

    const table = props.table;
    this.addEnvironment(config.ENV_HITS_TABLE, table.tableName);
    table.grantReadWriteData(this);
  }
}