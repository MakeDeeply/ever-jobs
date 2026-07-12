import { Module } from '@nestjs/common';
import { ECLService } from './ecldc.service';

@Module({ providers: [ECLService], exports: [ECLService] })
export class ECLModule {}
