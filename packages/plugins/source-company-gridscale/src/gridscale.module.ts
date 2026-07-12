import { Module } from '@nestjs/common';
import { GridscaleService } from './gridscale.service';

@Module({ providers: [GridscaleService], exports: [GridscaleService] })
export class GridscaleModule {}
