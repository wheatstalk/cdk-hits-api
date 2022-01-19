import { aws_dynamodb, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as config from './config';

export interface HitsTableProps {
  readonly removalPolicy?: RemovalPolicy;
}

export class HitsTable extends aws_dynamodb.Table {
  constructor(scope: Construct, id: string, props: HitsTableProps = {}) {
    super(scope, id, {
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: props.removalPolicy,
      partitionKey: {
        name: 'PK',
        type: aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: aws_dynamodb.AttributeType.STRING,
      },
    });

    this.addGlobalSecondaryIndex({
      indexName: config.GSI1,
      partitionKey: {
        name: config.GSI1_PK,
        type: aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: config.GSI1_SK,
        type: aws_dynamodb.AttributeType.STRING,
      },
    });
  }
}
