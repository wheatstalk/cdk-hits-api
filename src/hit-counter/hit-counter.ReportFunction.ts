import type * as lambda from 'aws-lambda';
import { getReport, TrackedHit } from './tracked-hit';

export async function handler(event: lambda.APIGatewayProxyEventV2): Promise<lambda.APIGatewayProxyResultV2> {
  const report = await getReport();
  return renderHitReportJson(report);
}

function renderHitReportJson(report: TrackedHit[]): lambda.APIGatewayProxyResultV2<never> | PromiseLike<lambda.APIGatewayProxyResultV2<never>> {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(report),
  };
}
