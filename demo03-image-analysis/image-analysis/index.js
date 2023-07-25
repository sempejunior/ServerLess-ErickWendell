const { promises: { readFile } } = require('fs');
const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');
const { get } = require('axios');


class Handler {
  constructor({ rekoSvc, translateSvc }) {
    this.rekoSvc = rekoSvc;
    this.translateSvc = translateSvc;
  }

  async detectImageLabels(buffer) {
    const command = new DetectLabelsCommand({
      Image: {
        Bytes: buffer
      }
    });

    try {
      const result = await this.rekoSvc.send(command);

      //Filtrando somente quem tiver confiança maior que 80
      const workingItems = result.Labels
        .filter(({ Confidence }) => Confidence > 80);

      const names = workingItems.map(({ Name }) => Name).join(' and ');

      return { names, workingItems };

    } catch (error) {
      console.log('Error****', error.stack);
      throw error;
    }
  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    };

    const command = new TranslateTextCommand(params);
    const { TranslatedText } = await this.translateSvc.send(command);

    console.log('TranslatedText', JSON.stringify(TranslatedText));
    return TranslatedText.split(' e ');
  }

  formatTextResults(texts, workingItems) {
    const finalText = texts.map((nameInPortuguese, indexText) => {
      const confidence = workingItems[indexText].Confidence.toFixed(2);
      return `${confidence}% de ser do tipo ${nameInPortuguese}`;
    });

    return finalText.join('\n');
  }

  async getImageBuffer(imageUrl) {
    console.log("Image URL", imageUrl);
    const response = await get(imageUrl, {
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data, 'base64');

    return buffer;
  }

  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters;
      //const imgBuffer = await readFile('./images/cat.jpg');
      console.log('Downloading image...');

      const buffer = await this.getImageBuffer(imageUrl);

      console.log('Detecting labels...');
      const { names, workingItems } = await this.detectImageLabels(buffer);

      console.log('Translation to Portuguese...');
      const texts = await this.translateText(names);

      console.log('Operation...');

      const finalText = this.formatTextResults(texts, workingItems);

      console.log('Finishing...');

      return {
        statusCode: 200,
        body: 'A imagem tem '.concat(finalText)
      };

    } catch (error) {
      console.log('Error****', error.stack);
      return {
        statusCode: error.statusCode || 500,
        body: 'Internal server error'
      };
    }
  }
}

// Crie uma instância da classe Handler e defina o método main como a função do Lambda.
const rekoClient = new RekognitionClient();
const translateClient = new TranslateClient();
const handler = new Handler({
  rekoSvc: rekoClient,
  translateSvc: translateClient
});

module.exports.main = handler.main.bind(handler);