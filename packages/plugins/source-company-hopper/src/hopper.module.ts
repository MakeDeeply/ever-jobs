import { Module } from '@nestjs/common';
import { HopperService } from './hopper.service';

@Module({ providers: [HopperService], exports: [HopperService] })
export class HopperModule {}
