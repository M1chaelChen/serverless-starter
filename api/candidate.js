"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");

AWS.config.setPromisesDependency(require("bluebird"));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.submit = async (event) => {
  try {
    const { fullname, email, experience } = JSON.parse(event.body);

    if (
      typeof fullname !== "string" ||
      typeof email !== "string" ||
      typeof experience !== "number"
    ) {
      console.error("Validation Failed");
      return new Error(
        "Couldn't submit candidate because of validation errors."
      );
    }

    const res = await submitCandidateP(
      candidateInfo(fullname, email, experience)
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Sucessfully submitted candidate with email ${email}`,
        candidateId: res.id
      })
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Unable to submit candidate with email ${email}`
      })
    };
  }
};

const submitCandidateP = candidate => {
  console.log("Submitting candidate");
  const candidateInfo = {
    TableName: process.env.CANDIDATE_TABLE,
    Item: candidate
  };
  return dynamoDb
    .put(candidateInfo)
    .promise()
    .then(res => candidate);
};

const candidateInfo = (fullname, email, experience) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    fullname: fullname,
    email: email,
    experience: experience,
    submittedAt: timestamp,
    updatedAt: timestamp
  };
};

exports.list = async (event) => {
  try {
    const params = {
      TableName: process.env.CANDIDATE_TABLE,
      ProjectionExpression: "id, fullname, email"
    };
  
    console.log("Scanning Candidate table.");
    const data = await dynamoDb.scan(params).promise();

    console.log("Scan succeeded.");
    return {
      statusCode: 200,
      body: JSON.stringify({
        candidates: data.Items
      })
    };
  } catch(err) {
    console.log(
      "Scan failed to load data. Error JSON:",
      JSON.stringify(err, null, 2)
    );
    return err;
  }
};

exports.get = async (event) => {
  try {
    const params = {
      TableName: process.env.CANDIDATE_TABLE,
      Key: {
        id: event.pathParameters.id,
      },
    };

    const result = await dynamoDb.get(params).promise();
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
    return response;
  } catch(err) {
    console.error(err);
    return new Error('Couldn\'t fetch candidate.');
  }
};