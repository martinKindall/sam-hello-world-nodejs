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
                return await getAllLanguages();
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
    await saveLanguage(language);
    return buildResponse("Language created!");
}

async function getAllLanguages() {
    return buildResponse(await readLanguages());
}

function unknownMethodResponse(method) {
    return buildResponse(`Method ${method} not allowed`);
}

// CRUD implementation

async function readLanguages() {
    return await getAllRecords(process.env.TABLE_NAME);
}

function saveLanguage(language) {
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

async function getAllRecords(tableName) {
    let allItems = [];
    let LastEvaluatedKeyFlag = true;
    let scanParams = {TableName: tableName};
    while (LastEvaluatedKeyFlag) {
        let responseData = await ddb.scan(scanParams).promise();
        let batchItems = responseData.Items;
        allItems = allItems.concat(batchItems);
        if (responseData.LastEvaluatedKey) {
            LastEvaluatedKeyFlag = true;
            scanParams.ExclusiveStartKey = responseData.LastEvaluatedKey
        } else {
            LastEvaluatedKeyFlag = false;
        }
    }
    return allItems;
}
