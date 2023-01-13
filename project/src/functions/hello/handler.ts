import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import * as AWS from 'aws-sdk'

import schema from './schema';
const dcoClient = new AWS.DynamoDB.DocumentClient();

const addUserName: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

  let errChecker = false;

  // Add data to the dynamoDB table
  await dcoClient.put({
    TableName: 'UsersTable',
    Item: {
      userName: event.body.name
    }
  }).promise()
  .catch(err => {
    if(err) {
      errChecker = true;
      return errChecker
    }
  });

  if(!errChecker) {
    return formatJSONResponse({
      statusCode: 200 
    });
  }

  return formatJSONResponse({
    statusCode: 400,
    message: 'Something went wrong on the saving'
  });
};

export const main = middyfy(addUserName);
