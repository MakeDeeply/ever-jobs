import { Module } from '@nestjs/common';
import { EpilotService } from './epilot.service';

@Module({ providers: [EpilotService], exports: [EpilotService] })
export class EpilotModule {}
