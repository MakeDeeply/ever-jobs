import { Module } from '@nestjs/common';
import { HarveyService } from './harvey.service';

@Module({ providers: [HarveyService], exports: [HarveyService] })
export class HarveyModule {}
