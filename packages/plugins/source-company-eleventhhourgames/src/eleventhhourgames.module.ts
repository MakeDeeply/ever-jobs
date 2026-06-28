import { Module } from '@nestjs/common';
import { EleventhHourGamesService } from './eleventhhourgames.service';

@Module({ providers: [EleventhHourGamesService], exports: [EleventhHourGamesService] })
export class EleventhHourGamesModule {}
