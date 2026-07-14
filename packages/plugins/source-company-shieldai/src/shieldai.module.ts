import { Module } from '@nestjs/common';
import { ShieldAIService } from './shieldai.service';

@Module({ providers: [ShieldAIService], exports: [ShieldAIService] })
export class ShieldAIModule {}
