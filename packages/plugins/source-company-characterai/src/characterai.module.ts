import { Module } from '@nestjs/common';
import { CharacterAIService } from './characterai.service';

@Module({ providers: [CharacterAIService], exports: [CharacterAIService] })
export class CharacterAIModule {}
