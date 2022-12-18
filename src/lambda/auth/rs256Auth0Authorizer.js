const { verify } = require('jsonwebtoken')


const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJUtUAhI4KqrZdMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1uZGZrY3dycnl5bnN1OHo4LnVzLmF1dGgwLmNvbTAeFw0yMjEyMTcx
MzIyNDFaFw0zNjA4MjUxMzIyNDFaMCwxKjAoBgNVBAMTIWRldi1uZGZrY3dycnl5
bnN1OHo4LnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAOl23r7V4Pwtc7+9hzUt9+5EGr6iVygO4y9MSr7L8yw7GMoIry8RSC+TjXnM
2vEal6UqvnM8KPtDZ3n8n9+U2osGM4Ewnj4oh4XbJDjS4o5qeQ/zIbEy+WrQiRmf
qb2aB2YhEgwXw0HJMMwgAXmZ4OWOd0cBSxGxj7rpOXVKVy/JIkS6sOV9N885TIXb
WDUBPlArnh/zP/B/uA+BpC1/6Jl1veaVIJTCTm5acnJHudoFjf9V1dQuuEmKm2U1
/sTkiPJIksMR56wSYO/ixEprkEhQFfc5YhRnbfJ2juWNpkLI7C/4razOtL7Swq6D
LhxsXjxyEHvH0TzV50Pi4eH5i00CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUv2xIzzez0AalbWD24Nl1ZGqCDqowDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQA52J2FtpGg+lATS/sK96mGXdI5wFptbi4OO5xp0DjB
WJQ1sialFQtRD7kH7eN+Gs9yxllOrbRiCngO4k9iEASihagFG5c5Rqd0PgBVpyYU
egq98z32XWm6kGxdWitItZkkB8/89CZddjjMy8BggK84VBS4o9s7jvoG1kBffnCG
n2EBq3U6+d2i6a9Yn9/t3Prou49oeCaKKkqbfoZk8oh1cEcqDrevk1hac58giD15
78T4uk+ocdw+k4a98ephvcbxjrc54nWxGQmjUJY7ebQ+uPRQKiuJrWAxWGlK668t
1QJhoKICpOOzNcnO/oKwM6IsSTdLVi4+xKVEYQt31on1
-----END CERTIFICATE-----`

exports.handler = async (event) => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User aws authorized')

    return {
      principalId: jwtToken.sub,
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

function verifyToken(authHeader) {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] })
}

