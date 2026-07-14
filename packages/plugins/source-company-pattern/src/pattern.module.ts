import { Module } from '@nestjs/common';
import { PatternService } from './pattern.service';

@Module({ providers: [PatternService], exports: [PatternService] })
export class PatternModule {}
