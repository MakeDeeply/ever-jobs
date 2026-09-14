import { Module } from '@nestjs/common';
import { KulaAiService } from './kula_ai.service';

@Module({
  providers: [KulaAiService],
  exports: [KulaAiService],
})
export class KulaAiModule {}
