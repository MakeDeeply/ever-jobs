import { Module } from '@nestjs/common';
import { SpykeGamesService } from './spykegames.service';

@Module({ providers: [SpykeGamesService], exports: [SpykeGamesService] })
export class SpykeGamesModule {}
