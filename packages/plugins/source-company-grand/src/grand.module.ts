import { Module } from '@nestjs/common';
import { GrandGamesService } from './grand.service';

@Module({ providers: [GrandGamesService], exports: [GrandGamesService] })
export class GrandGamesModule {}
