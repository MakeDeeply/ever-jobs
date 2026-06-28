import { Module } from '@nestjs/common';
import { PlayStationSonyInteractiveEntertainmentService } from './sonyinteractiveentertainmentglobal.service';

@Module({ providers: [PlayStationSonyInteractiveEntertainmentService], exports: [PlayStationSonyInteractiveEntertainmentService] })
export class PlayStationSonyInteractiveEntertainmentModule {}
