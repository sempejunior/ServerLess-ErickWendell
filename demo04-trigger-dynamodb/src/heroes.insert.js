const uuid = require('uuid');
class Handler {

    constructor({ dynamoDBSvc }) {
        this.dynamoDBSvc = dynamoDBSvc
        this.dynamodbTable = process.env.DYNAMODB_TABLE;
    }
    async insertItem(params) {
        return this.dynamoDBSvc.put(params).promise();
    }

    prepareData(data) {
        const params = {
            TableName: this.dynamodbTable,
            Item: {
                ...data,
                id: uuid.v1(),
                createdAt: new Date().toISOString()
            }
        }
        return params;
    }

    handlerSuccess(data) {

        const response = {
            statusCode: 200,
            body: JSON.stringify(data)
        }
        return response;
    }

    handlerError(data) {
        return {
            statusCode: data.statusCode || 501,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t create the item'
        }
    }

    async main(event) {
        try {
            console.log("Entrou")
            const data = JSON.parse(event.body);
            const dbParams = this.prepareData(data);

            await this.insertItem(dbParams);

            return this.handlerSuccess(dbParams.Item);

        } catch (error) {
            console.error('Deu ruim**', error);
            return this.handlerError({ statusCode: 500 });
        }
    }
}

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const handler = new Handler({
    dynamoDBSvc: dynamoDB
});
module.exports = handler.main.bind(handler);