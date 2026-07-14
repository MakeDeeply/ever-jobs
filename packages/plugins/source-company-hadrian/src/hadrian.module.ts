import { Module } from '@nestjs/common';
import { HadrianService } from './hadrian.service';

@Module({ providers: [HadrianService], exports: [HadrianService] })
export class HadrianModule {}
