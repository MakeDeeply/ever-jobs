import { Module } from '@nestjs/common';
import { DreamGamesService } from './dreamgames.service';

@Module({ providers: [DreamGamesService], exports: [DreamGamesService] })
export class DreamGamesModule {}
