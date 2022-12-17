const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION


const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

exports.handler = async (event) => {
    console.log('Caller event', event)
    const groupId = event.pathParameters.groupId
    const validGroupId = await groupExists(groupId)

    if (!validGroupId) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Group does not exist'
            })
        }
    }

    // TODO: Create an image
    const parsedBody = JSON.parse(event.body)
    const imageId = uuidv4();
    const timestamp = new Date().toISOString();

    const newItem = {
        groupId,
        timestamp,
        imageId,
        ...parsedBody,
        imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
    }

    const url = getUploadUrl(imageId)

    await docClient.put({
        TableName: imagesTable,
        Item: newItem
    }).promise();

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            item: newItem,
            uploadUrl: url
        })
    }
}

async function groupExists(groupId) {
    const result = await docClient
        .get({
            TableName: groupsTable,
            Key: {
                id: groupId
            }
        })
        .promise()

    console.log('Get group: ', result)
    return !!result.Item
}

function getUploadUrl(imageId) {
    return s3.getSignedUrl('putObject', { // The URL will allow to perform the PUT operation
        Bucket: bucketName, // Name of an S3 bucket
        Key: imageId, // id of an object this URL allows access to
        Expires: urlExpiration  // A URL is only valid for 5 minutes
    })
}