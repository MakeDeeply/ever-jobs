import { Module } from '@nestjs/common';
import { DeliveryHeroService } from './deliveryhero.service';

@Module({ providers: [DeliveryHeroService], exports: [DeliveryHeroService] })
export class DeliveryHeroModule {}
