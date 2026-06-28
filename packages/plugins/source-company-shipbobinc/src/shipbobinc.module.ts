import { Module } from '@nestjs/common';
import { ShipBobService } from './shipbobinc.service';

@Module({ providers: [ShipBobService], exports: [ShipBobService] })
export class ShipBobModule {}
