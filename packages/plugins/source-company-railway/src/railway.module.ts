import { Module } from '@nestjs/common';
import { RailwayService } from './railway.service';

@Module({ providers: [RailwayService], exports: [RailwayService] })
export class RailwayModule {}
