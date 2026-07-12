import { Module } from '@nestjs/common';
import { ContentsquareService } from './contentsquare.service';

@Module({ providers: [ContentsquareService], exports: [ContentsquareService] })
export class ContentsquareModule {}
