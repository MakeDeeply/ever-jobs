import { Module } from '@nestjs/common';
import { AtBayService } from './atbayjobs.service';

@Module({ providers: [AtBayService], exports: [AtBayService] })
export class AtBayModule {}
