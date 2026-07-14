import { Module } from '@nestjs/common';
import { SynthesiaService } from './synthesia.service';

@Module({ providers: [SynthesiaService], exports: [SynthesiaService] })
export class SynthesiaModule {}
