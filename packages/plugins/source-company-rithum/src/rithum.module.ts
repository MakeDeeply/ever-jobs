import { Module } from '@nestjs/common';
import { RithumService } from './rithum.service';

@Module({ providers: [RithumService], exports: [RithumService] })
export class RithumModule {}
