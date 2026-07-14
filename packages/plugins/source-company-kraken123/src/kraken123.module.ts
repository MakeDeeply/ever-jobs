import { Module } from '@nestjs/common';
import { KrakenService } from './kraken123.service';

@Module({ providers: [KrakenService], exports: [KrakenService] })
export class KrakenModule {}
