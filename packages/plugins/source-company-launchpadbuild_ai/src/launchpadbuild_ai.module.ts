import { Module } from '@nestjs/common';
import { LaunchpadbuildAiService } from './launchpadbuild_ai.service';

@Module({
  providers: [LaunchpadbuildAiService],
  exports: [LaunchpadbuildAiService],
})
export class LaunchpadbuildAiModule {}
