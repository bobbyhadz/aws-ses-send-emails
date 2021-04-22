import * as apiGateway from '@aws-cdk/aws-apigatewayv2';
import * as apiGatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import {SES_EMAIL_FROM, SES_REGION} from '../env';

if (!SES_EMAIL_FROM || !SES_REGION) {
  throw new Error(
    'Please add the SES_EMAIL_TO, SES_EMAIL_FROM and SES_REGION environment variables in an env.js file located in the root directory',
  );
}

export class CdkStarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 create the lambda that sends emails
    const mailerFunction = new NodejsFunction(this, 'mailer-function', {
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(3),
      handler: 'main',
      entry: path.join(__dirname, '/../src/mailer/index.ts'),
    });

    // 👇 Add permissions to the Lambda function to send Emails
    mailerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ses:SendEmail',
          'ses:SendRawEmail',
          'ses:SendTemplatedEmail',
        ],
        resources: [
          `arn:aws:ses:${SES_REGION}:${
            cdk.Stack.of(this).account
          }:identity/${SES_EMAIL_FROM}`,
        ],
      }),
    );

    // 👇 create the API that uses Lambda integration
    const httpApi = new apiGateway.HttpApi(this, 'api', {
      apiName: `my-api`,
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: [
          apiGateway.CorsHttpMethod.OPTIONS,
          apiGateway.CorsHttpMethod.GET,
          apiGateway.CorsHttpMethod.POST,
          apiGateway.CorsHttpMethod.PUT,
          apiGateway.CorsHttpMethod.PATCH,
          apiGateway.CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    });

    // 👇 add the /mailer route
    httpApi.addRoutes({
      methods: [apiGateway.HttpMethod.POST],
      path: '/mailer',
      integration: new apiGatewayIntegrations.LambdaProxyIntegration({
        handler: mailerFunction,
      }),
    });

    new cdk.CfnOutput(this, 'region', {value: cdk.Stack.of(this).region});
    new cdk.CfnOutput(this, 'apiUrl', {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value: httpApi.url!,
    });
  }
}
