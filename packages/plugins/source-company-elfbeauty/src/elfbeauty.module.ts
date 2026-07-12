import { Module } from '@nestjs/common';
import { ELFBeautyService } from './elfbeauty.service';

@Module({ providers: [ELFBeautyService], exports: [ELFBeautyService] })
export class ELFBeautyModule {}
