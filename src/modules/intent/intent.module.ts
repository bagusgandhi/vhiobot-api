import { Module } from '@nestjs/common';
import { IntentController } from './intent.controller';
import { DialogflowModule } from '../dialogflow/dialogflow.module';
import { IntentService } from './intent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Intent } from './entites/intent.entity';
import { IntentRepository } from './repositories/intent.repositories';
import { IntentContext } from './entites/intent-context.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([Intent, IntentContext]),
    DialogflowModule
  ],
  controllers: [IntentController],
  providers: [IntentRepository, IntentService]
})
export class IntentModule {}
