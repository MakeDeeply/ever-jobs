import { Module } from '@nestjs/common';
import { TheNewYorkTimesService } from './thenewyorktimes.service';

@Module({ providers: [TheNewYorkTimesService], exports: [TheNewYorkTimesService] })
export class TheNewYorkTimesModule {}
