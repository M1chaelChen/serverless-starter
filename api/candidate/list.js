"use strict";

const dynamoDb = require('../dynamoDb');

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