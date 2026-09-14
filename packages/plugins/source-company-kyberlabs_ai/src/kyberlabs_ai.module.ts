import { Module } from '@nestjs/common';
import { KyberlabsAiService } from './kyberlabs_ai.service';

@Module({
  providers: [KyberlabsAiService],
  exports: [KyberlabsAiService],
})
export class KyberlabsAiModule {}
