import { Module } from '@nestjs/common';
import { LightspeedCommerceService } from './lightspeedcommerce.service';

@Module({ providers: [LightspeedCommerceService], exports: [LightspeedCommerceService] })
export class LightspeedCommerceModule {}
