import { Module } from '@nestjs/common';
import { NMIService } from './nmi.service';

@Module({ providers: [NMIService], exports: [NMIService] })
export class NMIModule {}
