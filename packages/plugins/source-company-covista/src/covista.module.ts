import { Module } from '@nestjs/common';
import { CovistaService } from './covista.service';

@Module({ providers: [CovistaService], exports: [CovistaService] })
export class CovistaModule {}
