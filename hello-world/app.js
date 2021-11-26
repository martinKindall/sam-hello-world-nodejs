// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';

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

    switch (httpMethod) {
        case 'POST':
            return createLanguage(event);

        case 'GET':
            return getAllLanguages();
        default:
            return unknownMethodResponse(httpMethod);
    }
};


function createLanguage(event) {
    const language = JSON.parse(event.body);
    return buildResponse(language);
}

function getAllLanguages() {
    return buildResponse("Hola que onda!");
}

function unknownMethodResponse(method) {
    return buildResponse(`Method ${method} not allowed`);
}

function buildResponse(body) {
    return {
        'statusCode': 200,
        'body': JSON.stringify(body)
    };
}
