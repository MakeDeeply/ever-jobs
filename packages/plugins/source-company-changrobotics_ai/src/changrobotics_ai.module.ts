import { Module } from '@nestjs/common';
import { ChangroboticsAiService } from './changrobotics_ai.service';

@Module({
  providers: [ChangroboticsAiService],
  exports: [ChangroboticsAiService],
})
export class ChangroboticsAiModule {}
