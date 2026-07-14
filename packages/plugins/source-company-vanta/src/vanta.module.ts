import { Module } from '@nestjs/common';
import { VantaService } from './vanta.service';

@Module({ providers: [VantaService], exports: [VantaService] })
export class VantaModule {}
