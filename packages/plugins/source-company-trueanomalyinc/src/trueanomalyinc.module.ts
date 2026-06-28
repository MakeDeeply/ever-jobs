import { Module } from '@nestjs/common';
import { TrueAnomalyService } from './trueanomalyinc.service';

@Module({ providers: [TrueAnomalyService], exports: [TrueAnomalyService] })
export class TrueAnomalyModule {}
