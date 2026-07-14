import { Module } from '@nestjs/common';
import { FiddlerAIService } from './fiddlerai.service';

@Module({ providers: [FiddlerAIService], exports: [FiddlerAIService] })
export class FiddlerAIModule {}
