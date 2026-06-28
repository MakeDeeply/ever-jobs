import { Module } from '@nestjs/common';
import { GhostStoryGamesService } from './gsgcareers.service';

@Module({ providers: [GhostStoryGamesService], exports: [GhostStoryGamesService] })
export class GhostStoryGamesModule {}
