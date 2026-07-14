import { Module } from '@nestjs/common';
import { BoydGamingService } from './boydgaming.service';

@Module({ providers: [BoydGamingService], exports: [BoydGamingService] })
export class BoydGamingModule {}
