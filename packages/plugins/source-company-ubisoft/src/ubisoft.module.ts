import { Module } from '@nestjs/common';
import { UbisoftService } from './ubisoft.service';

@Module({ providers: [UbisoftService], exports: [UbisoftService] })
export class UbisoftModule {}
