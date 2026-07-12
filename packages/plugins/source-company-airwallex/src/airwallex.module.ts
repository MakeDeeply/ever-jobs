import { Module } from '@nestjs/common';
import { AirwallexService } from './airwallex.service';

@Module({ providers: [AirwallexService], exports: [AirwallexService] })
export class AirwallexModule {}
