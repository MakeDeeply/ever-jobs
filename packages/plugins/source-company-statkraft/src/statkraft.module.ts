import { Module } from '@nestjs/common';
import { StatkraftService } from './statkraft.service';

@Module({ providers: [StatkraftService], exports: [StatkraftService] })
export class StatkraftModule {}
