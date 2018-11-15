"use strict";

const dynamoDb = require('../dynamoDb');

exports.get = async event => {
  try {
    const params = {
      TableName: process.env.CANDIDATE_TABLE,
      Key: {
        id: event.pathParameters.id
      }
    };

    const result = await dynamoDb.get(params).promise();
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item)
    };
    return response;
  } catch (err) {
    console.error(err);
    return new Error("Couldn't fetch candidate.");
  }
};
