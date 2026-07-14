import { Module } from '@nestjs/common';
import { EcoVadisService } from './ecovadis.service';

@Module({ providers: [EcoVadisService], exports: [EcoVadisService] })
export class EcoVadisModule {}
