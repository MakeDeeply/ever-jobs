import { Module } from '@nestjs/common';
import { SpaceKnowService } from './spaceknow.service';

@Module({ providers: [SpaceKnowService], exports: [SpaceKnowService] })
export class SpaceKnowModule {}
