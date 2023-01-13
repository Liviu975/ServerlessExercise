import type { AWS } from '@serverless/typescript';

import addUserName from '@functions/hello';

const serverlessConfiguration: AWS = {
  service: 'project',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-add-api-key'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        statements: [{
          Effect: "Allow",
          Action: [
            "dynamodb:GetItem",
            "dynamodb:PutItem",
          ],
          Resource: "arn:aws:dynamodb:us-east-1:*:table/UsersTable",
        }],
      },
    },
  },
  // import the function via paths
  functions: { addUserName },
  package: { individually: true },
  custom: {
    apiKeys: [{
      name: "AccessKeyN"
    }],
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb:{
      start:{
        port: 5000,
        inMemory: true,
        migrate: true,
      },
      stages: "dev"
    }
  },
  resources: {
    Resources: {
      TodosTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "UsersTable",
          AttributeDefinitions: [{
            AttributeName: "userName",
            AttributeType: "S",
          }],
          KeySchema: [{
            AttributeName: "userName",
            KeyType: "HASH"
          }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },

        }
      }
    }
  }
  
};

module.exports = serverlessConfiguration;
