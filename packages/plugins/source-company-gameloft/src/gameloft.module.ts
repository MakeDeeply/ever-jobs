import { Module } from '@nestjs/common';
import { GameloftService } from './gameloft.service';

@Module({ providers: [GameloftService], exports: [GameloftService] })
export class GameloftModule {}
