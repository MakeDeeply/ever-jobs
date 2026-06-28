import { Module } from '@nestjs/common';
import { ShipMonkService } from './shipmonk.service';

@Module({ providers: [ShipMonkService], exports: [ShipMonkService] })
export class ShipMonkModule {}
