import type * as lambda from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as config from './config';

export interface TrackedHit {
  readonly code: string;
  readonly count: number;
}

export async function trackHit(code: string, event: lambda.APIGatewayProxyEventV2) {
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const hitsTable = config.getHitsTable();

  const isoNow = new Date().toISOString();
  const trackPromise = documentClient.put({
    TableName: hitsTable,
    Item: {
      PK: `TRACK#${code}`,
      SK: `TRACK#${isoNow}#${event.requestContext.requestId}`,
      Event: event,
    },
  }).promise();

  const pk = `HITS#${code}`;
  const updateResult = await documentClient.update({
    TableName: hitsTable,
    Key: {
      PK: pk,
      SK: pk,
    },
    UpdateExpression: 'SET #Count = if_not_exists(#Count, :Start) + :Increment, #GSI1PK = :GSI1PK, #GSI1SK = :GSI1SK',
    ExpressionAttributeNames: {
      '#Count': 'Count',
      '#GSI1PK': config.GSI1_PK,
      '#GSI1SK': config.GSI1_SK,
    },
    ExpressionAttributeValues: {
      ':Start': 0,
      ':Increment': 1,
      ':GSI1PK': 'HITS',
      ':GSI1SK': pk,
    },
    ReturnValues: 'UPDATED_NEW',
  }).promise();

  await trackPromise;

  return {
    code,
    count: updateResult.Attributes?.Count ?? 0,
  };
}

export async function getReport(): Promise<TrackedHit[]> {
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const hitsTable = config.getHitsTable();

  const result = await documentClient.query({
    TableName: hitsTable,
    IndexName: config.GSI1,
    KeyConditionExpression: '#GSI1PK = :GSI1PK',
    ExpressionAttributeNames: {
      '#GSI1PK': config.GSI1_PK,
    },
    ExpressionAttributeValues: {
      ':GSI1PK': 'HITS',
    },
  }).promise();

  const hits = (result.Items ?? [])
    .map(mapAttributeMapToTrackedHit)
    .sort((a, b) => a.code.localeCompare(b.code));

  return hits;
}

function mapAttributeMapToTrackedHit(item: AWS.DynamoDB.DocumentClient.AttributeMap): TrackedHit {
  const [_, code] = item.PK.split('#');
  const count = item.Count;

  return {
    code,
    count,
  };
}