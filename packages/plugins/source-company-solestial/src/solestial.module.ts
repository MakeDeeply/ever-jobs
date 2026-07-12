import { Module } from '@nestjs/common';
import { SolestialService } from './solestial.service';

@Module({ providers: [SolestialService], exports: [SolestialService] })
export class SolestialModule {}
