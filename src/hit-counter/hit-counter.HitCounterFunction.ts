import type * as lambda from 'aws-lambda';
import { TrackedHit, trackHit } from './tracked-hit';

export async function handler(event: lambda.APIGatewayProxyEventV2): Promise<lambda.APIGatewayProxyResultV2> {
  const code = event.pathParameters?.code ?? '<NONE>';
  const hit = await trackHit(code, event);

  return renderHitJson(hit);
}

function renderHitJson(hit: TrackedHit): lambda.APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(hit),
  };
}
