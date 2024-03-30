import { Module } from '@nestjs/common';
import { DialogflowService } from './dialogflow.service';

@Module({
  providers: [DialogflowService],
  exports: [DialogflowService]
})
export class DialogflowModule {}
