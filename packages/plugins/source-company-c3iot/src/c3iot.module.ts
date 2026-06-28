import { Module } from '@nestjs/common';
import { C3AIService } from './c3iot.service';

@Module({ providers: [C3AIService], exports: [C3AIService] })
export class C3AIModule {}
