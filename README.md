# How to send emails with SES in AWS CDK

A repository for an article on
[bobbyhadz.com](https://bobbyhadz.com/blog/aws-ses-send-emails)

> If you use CDK v1, switch to the cdk-v1 branch

## How to Use

1. Clone the repository

2. Install the dependencies

```bash
npm install
```

3. Create an `env.ts` file in the root directory, providing the variables listed
   in the `env.example.ts` file:

```typescript
export const SES_REGION = 'YOUR_SES_REGION';
export const SES_EMAIL_TO = 'YOUR_SES_RECIPIENT_EMAIL';
export const SES_EMAIL_FROM = 'YOUR_SES_SENDER_EMAIL';
```

3. Create the CDK stack

```bash
npx aws-cdk deploy cdk-stack \
  --outputs-file ./cdk-outputs.json
```

4. Open the AWS Console and the stack should be created in your default region

5. Cleanup

```bash
npx aws-cdk destroy
```
