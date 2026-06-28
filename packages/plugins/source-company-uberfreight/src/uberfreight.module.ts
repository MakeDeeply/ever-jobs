import { Module } from '@nestjs/common';
import { UberFreightService } from './uberfreight.service';

@Module({ providers: [UberFreightService], exports: [UberFreightService] })
export class UberFreightModule {}
