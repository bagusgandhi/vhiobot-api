import { Injectable, Logger } from '@nestjs/common';
import { Env } from 'src/config/env-loader';
import dialogflow from '@google-cloud/dialogflow';
import { google } from '@google-cloud/dialogflow/build/protos/protos';
import { MessageInput } from './dto/message-input.dto';

const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_PROJECT_ID, LANGUAGE_CODE } = Env();

@Injectable()
export class DialogflowService {
    private readonly logger = new Logger(DialogflowService.name)

    private readonly credentials = {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY
    }

    private readonly sessionClient = new dialogflow.SessionsClient({
        projectId: GOOGLE_PROJECT_ID,
        credentials: this.credentials
    });

    private readonly intentClients = new dialogflow.IntentsClient({
        projectId: GOOGLE_PROJECT_ID,
        credentials: this.credentials
    });

    async queryText(messageInput: MessageInput): Promise<any> {
        let textToDialogFlow = typeof messageInput.message === 'string' ? messageInput.message : JSON.stringify(messageInput.message);
        try {
            const sessionPath = this.sessionClient.projectAgentSessionPath(
                GOOGLE_PROJECT_ID,
                messageInput.session
            );

            let request: google.cloud.dialogflow.v2.IDetectIntentRequest;

            request = {
                session: sessionPath,
                queryInput: {
                    text: {
                        text: textToDialogFlow,
                        languageCode: LANGUAGE_CODE
                    }
                }
            }

            const responses = await this.sessionClient.detectIntent(request);
            this.logger.log({ mqueryTextessage: 'Dialogflow response', responses });

            const result = responses[0].queryResult;
            this.logger.log({ message: 'Intent Result', intentName: result.intent.displayName });

            return result.fulfillmentText;
        } catch (error) {
            this.logger.log({ meesage: 'Dialogflow Error', error });
            throw new Error('Dialogflow Error');
        }
    }

}
