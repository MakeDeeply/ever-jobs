import { Module } from '@nestjs/common';
import { GustiLederService } from './gustileder.service';

@Module({ providers: [GustiLederService], exports: [GustiLederService] })
export class GustiLederModule {}
