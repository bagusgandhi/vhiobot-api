import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Env } from 'src/config/env-loader';
import dialogflow from '@google-cloud/dialogflow';
import { google } from '@google-cloud/dialogflow/build/protos/protos';
import { MessageInput } from './dto/message-input.dto';
import { CreateIntentDto } from '../intent/dto/create-intent.dto';
import { UpdateIntentDto } from '../intent/dto/update-intent.dto';

const {
  GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  GOOGLE_PROJECT_ID,
  LANGUAGE_CODE,
} = Env();

@Injectable()
export class DialogflowService {
  private readonly logger = new Logger(DialogflowService.name);

  private readonly credentials = {
    client_email: GOOGLE_CLIENT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  };

  private readonly sessionClient = new dialogflow.SessionsClient({
    projectId: GOOGLE_PROJECT_ID,
    credentials: this.credentials,
  });

  private readonly intentClients = new dialogflow.IntentsClient({
    projectId: GOOGLE_PROJECT_ID,
    credentials: this.credentials,
  });

  async queryText(messageInput: MessageInput): Promise<any> {
    const textToDialogFlow =
      typeof messageInput.message === 'string'
        ? messageInput.message
        : JSON.stringify(messageInput.message);
    try {
      const sessionPath = this.sessionClient.projectAgentSessionPath(
        GOOGLE_PROJECT_ID,
        messageInput.session,
      );

      let request: google.cloud.dialogflow.v2.IDetectIntentRequest;

      // eslint-disable-next-line prefer-const
      request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: textToDialogFlow,
            languageCode: LANGUAGE_CODE,
          },
        },
      };

      const responses = await this.sessionClient.detectIntent(request);
      this.logger.log({ mqueryTextessage: 'Dialogflow response', responses });

      const result = responses[0].queryResult;
      this.logger.log({
        message: 'Intent Result',
        intentName: result.intent.displayName,
      });

      return result.fulfillmentText;
    } catch (error) {
      this.logger.log({ meesage: 'Dialogflow Error', error });
      throw new Error('Dialogflow Error');
    }
  }

  async createIntent(createIntentDto: CreateIntentDto) {
    try {
      const { trainingPhrasesParts, messageTexts, displayName } =
        createIntentDto;
      const agentPath = this.intentClients.projectAgentPath(GOOGLE_PROJECT_ID);

      const trainingPhrases = trainingPhrasesParts.map((part) => {
        return {
          type: 'vhiobot phrase',
          parts: [{ text: part }],
        };
      });

      const messageText = {
        text: messageTexts,
      };

      const intent = {
        displayName: displayName,
        trainingPhrases: trainingPhrases,
        messages: [{ text: messageText }],
      };

      const request: any = {
        parent: agentPath,
        intent: intent,
      };

      const [response] = await this.intentClients.createIntent(request);
      return response;
    } catch (error) {
      this.logger.log({ meesage: 'Dialogflow Error', error });
      throw new Error('Dialogflow Error');
    }
  }

  async updateIntent(dfIntentId: string, updateIntentDto: UpdateIntentDto) {
    try {
      const { trainingPhrasesParts, messageTexts, displayName } =
        updateIntentDto;

      const trainingPhrases = trainingPhrasesParts.map((part) => {
        return {
          type: 'vhiobot phrase',
          parts: [{ text: part }],
        };
      });

      const intentPath = this.intentClients.projectAgentIntentPath(
        GOOGLE_PROJECT_ID,
        dfIntentId.split('/')[4],
      );

      const request: any = {
        intent: {
          name: intentPath,
          displayName: displayName,
          trainingPhrases: trainingPhrases,
          messages: [
            {
              text: { text: [...messageTexts] },
            }
          ]
        },
        updateMask: {
          paths: ['display_name', 'training_phrases', 'messages'],
        },
      };

      const response = this.intentClients.updateIntent(request);

      return response;
    } catch (error) {
      this.logger.log({ meesage: 'Dialogflow Error', error });
      throw new Error('Dialogflow Error');
    }
  }

  async getAllIntent(): Promise<any> {
    try {
      const [response] = await this.intentClients.listIntents({
        parent: `projects/${GOOGLE_PROJECT_ID}/agent`,
      });

      const intents = response.map((intent) => {
        return {
          intentId: intent.name.split('/').pop(),
          displayName: intent.displayName,
        };
      });

      return intents;

      // return { intents: intents.map((intent) => intent.displayName) };
    } catch (error) {
      this.logger.log({ meesage: 'Dialogflow Error', error });
      throw new Error('Dialogflow Error');
    }
  }

  async getIntentByIntentId(intentId: string): Promise<any> {
    try {
      const [intent] = await this.intentClients.getIntent({
        name: `projects/${GOOGLE_PROJECT_ID}/agent/intents/${intentId}`,
        intentView: 'INTENT_VIEW_FULL',
      });

      return intent;
    } catch (error) {
      this.logger.log({ meesage: 'Dialogflow Error', error });
      throw new Error('Dialogflow Error');
    }
  }

  async addResponseIntent(
    intentId: string,
    displayName: string,
    responseIntent: string,
  ): Promise<any> {
    try {
      const [currentIntent] = await this.intentClients.getIntent({
        name: `projects/${GOOGLE_PROJECT_ID}/agent/intents/${intentId}`,
        intentView: 'INTENT_VIEW_FULL',
      });

      const newResponseIntent = {
        text: {
          text: [responseIntent],
        },
      };

      currentIntent.messages.push(newResponseIntent);

      // Update the intent
      const request = {
        intent: currentIntent,
        displayName,
      };

      const [updatedIntent] = await this.intentClients.updateIntent(request);
      return updatedIntent;
    } catch (error) {
      this.logger.log({ meesage: 'Dialogflow Error', error });
      // throw new Error('Dialogflow Error');
      throw new InternalServerErrorException('Dialogflow Error');
    }
  }

  async addTrainingPhrasesIntent(
    intentId: string,
    displayName: string,
    trainingPhrase: string,
  ): Promise<any> {
    try {
      const [currentIntent] = await this.intentClients.getIntent({
        name: `projects/${GOOGLE_PROJECT_ID}/agent/intents/${intentId}`,
        intentView: 'INTENT_VIEW_FULL',
      });

      const isTrainingPhraseExist = currentIntent.trainingPhrases.some(
        (phrase) => {
          return phrase.parts[0].text === trainingPhrase;
        },
      );

      if (!isTrainingPhraseExist) {
        currentIntent.trainingPhrases.push({
          parts: [{ text: trainingPhrase }],
        });
      }

      // Update the intent
      const request = {
        intent: currentIntent,
        displayName,
      };

      const [updatedIntent] = await this.intentClients.updateIntent(request);
      return updatedIntent;
    } catch (error) {
      this.logger.log({ meesage: 'Dialogflow Error', error });
      throw new Error('Dialogflow Error');
    }
  }

  async deleteTrainingPhrase(
    intentId: string,
    displayName: string,
    trainingPhrase: string,
  ): Promise<any> {
    try {
      const [currentIntent] = await this.intentClients.getIntent({
        name: `projects/${GOOGLE_PROJECT_ID}/agent/intents/${intentId}`,
        intentView: 'INTENT_VIEW_FULL',
      });

      // Find the index of the training phrase to delete
      const indexToDelete = currentIntent.trainingPhrases.findIndex(
        (phrase) => {
          return phrase.parts[0].text === trainingPhrase;
        },
      );

      // Delete the training phrase if found
      if (indexToDelete !== -1) {
        currentIntent.trainingPhrases.splice(indexToDelete, 1);
      }

      // Update the intent
      const request = {
        intent: currentIntent,
        displayName,
      };

      const [updatedIntent] = await this.intentClients.updateIntent(request);
      return updatedIntent;
    } catch (error) {
      this.logger.log({ message: 'Dialogflow Error', error });
      throw new Error('Dialogflow Error');
    }
  }

  async deleteIntent(dfIntentId: string) {
    try {
      await this.intentClients.deleteIntent({ name: dfIntentId });
    } catch (error) {
      this.logger.log({ meesage: 'Dialogflow Error', error });
      throw new Error('Dialogflow Error');
    }
  }
}
