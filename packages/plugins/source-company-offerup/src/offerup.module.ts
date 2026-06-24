import { Module } from '@nestjs/common';
import { OfferUpService } from './offerup.service';

@Module({ providers: [OfferUpService], exports: [OfferUpService] })
export class OfferUpModule {}
