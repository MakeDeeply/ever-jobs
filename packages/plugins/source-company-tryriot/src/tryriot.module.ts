import { Module } from '@nestjs/common';
import { RIOTService } from './tryriot.service';

@Module({ providers: [RIOTService], exports: [RIOTService] })
export class RIOTModule {}
