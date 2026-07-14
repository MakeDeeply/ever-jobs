import { Module } from '@nestjs/common';
import { MonMarchFrService } from './monmarchfr.service';

@Module({ providers: [MonMarchFrService], exports: [MonMarchFrService] })
export class MonMarchFrModule {}
