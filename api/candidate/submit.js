"use strict";

const uuid = require("uuid");
const dynamoDb = require('../dynamoDb');

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

const submitCandidateP = async candidate => {
  console.log("Submitting candidate");
  const candidateInfo = {
    TableName: process.env.CANDIDATE_TABLE,
    Item: candidate
  };

  return dynamoDb
  .put(candidateInfo)
  .promise();
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


