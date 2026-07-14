import { Module } from '@nestjs/common';
import { TOMSService } from './toms.service';

@Module({ providers: [TOMSService], exports: [TOMSService] })
export class TOMSModule {}
