const { verify } = require('jsonwebtoken')
const { secretsManager } = require('middy/middlewares')
const middy = require('middy')

// const auth0Secret = process.env.AUTH_0_SECRET
const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

const handler = middy(
    async (event, context) => {
        try {
            const decodedToken = verifyToken(event.authorizationToken, context.AUTH0_SECRET[secretField])
            console.log('User aws authorized')

            return {
                principalId: decodedToken.sub,
                policyDocument: {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Action: 'execute-api:Invoke',
                            Effect: 'Allow',
                            Resource: '*'
                        }
                    ]
                }
            }
        } catch (error) {
            console.log('User was not authorized', e.message);

            return {
                principalId: 'user',
                policyDocument: {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Action: 'execute-api:Invoke',
                            Effect: 'Deny',
                            Resource: '*'
                        }
                    ]
                }
            }
        }
    }
)

handler.use(
    secretsManager({
        cache: true,
        cacheExpiryInMillis: 60000,
        throwOnFailedCall: true,
        secrets: {
            AUTH0_SECRET: secretId
        }
    })
)

exports.handler = handler

function verifyToken(authHeader, secret) {
    if (!authHeader) {
        throw new Error('No authorization header')
    }

    if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
        throw new Error('Invalid authorization header')
    }

    const split = authHeader.split(' ');
    const token = split[1]

    return verify(token, secret)
}

// function verifyToken(authHeader, secret) {
//     if (!authHeader)
//         throw new Error('No authentication header')

//     if (!authHeader.toLowerCase().startsWith('bearer '))
//         throw new Error('Invalid authentication header')

//     const split = authHeader.split(' ')
//     const token = split[1]

//     return verify(token, secret)
// }