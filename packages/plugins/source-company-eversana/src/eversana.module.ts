import { Module } from '@nestjs/common';
import { EVERSANAService } from './eversana.service';

@Module({ providers: [EVERSANAService], exports: [EVERSANAService] })
export class EVERSANAModule {}
