import { Module } from '@nestjs/common';
import { TigerDataTimescaleService } from './tigerdatatimescale.service';

@Module({ providers: [TigerDataTimescaleService], exports: [TigerDataTimescaleService] })
export class TigerDataTimescaleModule {}
