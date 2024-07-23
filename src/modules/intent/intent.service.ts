import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DialogflowService } from '../dialogflow/dialogflow.service';
import { Intent } from './entites/intent.entity';
import { IntentRepository } from './repositories/intent.repositories';
import { CreateIntentDto } from './dto/create-intent.dto';
import { GetAllIntentDto } from './dto/get-all-intent.dto';
import { UpdateIntentDto } from './dto/update-intent.dto';

@Injectable()
export class IntentService {
  private readonly logger = new Logger(IntentService.name);
  constructor(
    private readonly dialogflowService: DialogflowService,
    private readonly intentRepository: IntentRepository,
  ) {}

  async getAllIntent(query: GetAllIntentDto) {
    try {
      const intent = await this.intentRepository.queryPaginate(
        query.page,
        query.limit,
      );
      return intent;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async getIntentById(uuid: string) {
    try {
      const intent = await this.intentRepository.findByIntentId(uuid);
      return intent;
    } catch (error) {
      this.logger.error('error', error);
      throw new HttpException(error.message, error.code);
    }
  }

  async createIntent(createIntentDto: CreateIntentDto) {
    const { trainingPhrasesParts, messageTexts, displayName } = createIntentDto;

    // run query and start transaction
    const queryRunner =
      this.intentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // request to dialogflow create intent
      const response =
        await this.dialogflowService.createIntent(createIntentDto);

      // Save intent to database
      const newIntent = new Intent();
      newIntent.displayName = displayName;
      newIntent.trainingPhrases = trainingPhrasesParts;
      newIntent.responseTexts = messageTexts;
      newIntent.dfIntentId = response.name; // dialogflow intentId

      const result = await queryRunner.manager.save(Intent, newIntent);

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      // rollback data when something wrong
      await queryRunner.rollbackTransaction();

      this.logger.error(error);
      throw new HttpException(error.message, 500);
    } finally {
      await queryRunner.release();
    }
  }

  async updateIntent(uuid: string, updateIntentDto: UpdateIntentDto) {
    const { trainingPhrasesParts, messageTexts, displayName } = updateIntentDto;

    // Run query and start transaction
    const queryRunner =
      this.intentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch existing intent from database
      const existingIntent = await this.intentRepository.findByIntentId(uuid);
      if (!existingIntent) {
        throw new HttpException('Intent not found', 404);
      }

      // Update intent in Dialogflow
      const response = await this.dialogflowService.updateIntent(
        existingIntent.dfIntentId,
        updateIntentDto,
      );

      this.logger.log("response", response)

      // Update intent in the database
      existingIntent.displayName = displayName;
      existingIntent.trainingPhrases = trainingPhrasesParts;
      existingIntent.responseTexts = messageTexts;

      const result = await queryRunner.manager.save(Intent, existingIntent);

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      // rollback data when something wrong
      await queryRunner.rollbackTransaction();

      this.logger.error(error);
      throw new HttpException(error.message, 500);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteIntent(uuid: string) {
    const queryRunner =
      this.intentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const intent = await this.intentRepository.findByIntentId(uuid);

      if (!intent) {
        throw new NotFoundException(`Intent with ID ${uuid} not found`);
      }

      await this.dialogflowService.deleteIntent(intent.dfIntentId);

      // Delete intent
      await queryRunner.manager.delete(Intent, { uuid });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
