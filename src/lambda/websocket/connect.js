const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE

exports.handler = async (event) => {
    console.log('Websocket connect', event)

    const connectionId = event.requestContext.connectionId
    const timestamp = new Date().toISOString()

    const item = {
        id: connectionId,
        timestamp
    }

    console.log('Storing item: ', item)

    await docClient.put({
        TableName: connectionsTable,
        Item: item
    }).promise()

    return {
        statusCode: 200,
        body: ''
    }
}
