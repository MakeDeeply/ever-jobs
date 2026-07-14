import { Module } from '@nestjs/common';
import { SIXTService } from './sixt.service';

@Module({ providers: [SIXTService], exports: [SIXTService] })
export class SIXTModule {}
