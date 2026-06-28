import { Module } from '@nestjs/common';
import { GatikAIService } from './gatikaiinc.service';

@Module({ providers: [GatikAIService], exports: [GatikAIService] })
export class GatikAIModule {}
