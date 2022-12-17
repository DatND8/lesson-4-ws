const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient();
const groupsTable = process.env.GROUPS_TABLE;

exports.handler = async (event) => {
    const itemId = uuidv4();

    const parsedBody = JSON.parse(event.body)

    const newItem = {
        id: itemId,
        ...parsedBody
    }

    await docClient.put({
        TableName: groupsTable,
        Item: newItem
    }).promise();

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            item: newItem
        })
    }
}
