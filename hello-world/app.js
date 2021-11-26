// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';

const AWS = require('aws-sdk');
AWS.config.update({region:  process.env.REGION_NAME});
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    const httpMethod = event.httpMethod;
    console.log('Probando logs'); 
    console.log(JSON.stringify(event));

    try {
        switch (httpMethod) {
            case 'POST':
                return await createLanguage(event.body);
    
            case 'GET':
                return getAllLanguages();
            default:
                return unknownMethodResponse(httpMethod);
        }
    } catch (error) {
        console.error(error);
        return buildResponse("Server error.", 500)
    }
};

// Controllers

async function createLanguage(body) {
    const language = JSON.parse(body);
    await saveLanguageInDB(language);
    return buildResponse("Language created!");
}

function getAllLanguages() {
    return buildResponse("Hola que onda!");
}

function unknownMethodResponse(method) {
    return buildResponse(`Method ${method} not allowed`);
}

// CRUD implementation

function saveLanguageInDB(language) {
    const languageDTO = {
        TableName: process.env.TABLE_NAME,
        Item: {
            'name' : {S: language.name},
            'release_date' : {S: language.lanzamiento},
            'statically_typed': {BOOL: language.tipado_fuerte},
        }
    };

    return ddb.putItem(languageDTO).promise();
}

// Utils

function buildResponse(body, status=200) {
    return {
        'statusCode': status,
        'body': JSON.stringify(body)
    };
}
