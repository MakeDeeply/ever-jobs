import { Module } from '@nestjs/common';
import { AqemiaService } from './aqemiacom.service';

@Module({ providers: [AqemiaService], exports: [AqemiaService] })
export class AqemiaModule {}
