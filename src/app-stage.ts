import * as aws_apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { Aspects, aws_certificatemanager, aws_route53, aws_route53_targets, Stack, Stage, StageProps } from 'aws-cdk-lib';
import { Watchful, WatchfulAspect } from 'cdk-watchful';
import { Construct } from 'constructs';
import { HitCounter, HitsTable } from './hit-counter';

export interface DnsConfig {
  /**
   * FQDN of the API
   */
  readonly domainName: string;

  /**
   * ARN of the certificate for the API
   */
  readonly certificateArn: string;

  /**
   * Route53 Hosted Zone ID to create a record in
   */
  readonly hostedZoneId: string;

  /**
   * Domain name of the Hosted Zone.
   */
  readonly hostedZoneName: string;
}

export interface AppStageProps extends StageProps {
  /**
   * DNS configuration for the API.
   * @default - no dns name used
   */
  readonly dnsConfig?: DnsConfig;
}

export class AppStage extends Stage {
  constructor(scope: Construct, id: string, props: AppStageProps = {}) {
    super(scope, id, props);

    const stateful = new Stack(this, 'Stateful');
    const table = new HitsTable(stateful, 'Table');

    const stateless = new Stack(this, 'Stateless');

    const domainMapping = getDomainMapping(stateless, props.dnsConfig);
    new HitCounter(stateless, 'HitCounter', {
      domainMapping,
      table,
    });

    if (domainMapping && props.dnsConfig) {
      const domainName = domainMapping.domainName;
      const dnsConfig = props.dnsConfig;

      const zone = aws_route53.HostedZone.fromHostedZoneAttributes(stateless, 'HostedZone', {
        hostedZoneId: dnsConfig.hostedZoneId,
        zoneName: dnsConfig.hostedZoneName,
      });

      new aws_route53.ARecord(stateless, `ARecord_${dnsConfig.domainName}`, {
        zone,
        recordName: dnsConfig.domainName,
        target: aws_route53.RecordTarget.fromAlias(
          new aws_route53_targets.ApiGatewayv2DomainProperties(domainName.regionalDomainName, domainName.regionalHostedZoneId),
        ),
      });
    }

    const watchful = new Watchful(stateless, 'Watchful', {
      dashboardName: `${stateful.stackName}`,
    });
    Aspects.of(this).add(new WatchfulAspect(watchful));
  }
}

function getDomainMapping(scope: Construct, dnsConfig: DnsConfig | undefined) {
  if (!dnsConfig) {
    return undefined;
  }

  return {
    domainName: new aws_apigatewayv2.DomainName(scope, 'DomainName', {
      domainName: dnsConfig.domainName,
      certificate: aws_certificatemanager.Certificate.fromCertificateArn(scope, 'Certificate', dnsConfig?.certificateArn),
    }),
  };
}