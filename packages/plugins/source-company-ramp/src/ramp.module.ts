import { Module } from '@nestjs/common';
import { RampService } from './ramp.service';

@Module({ providers: [RampService], exports: [RampService] })
export class RampModule {}
