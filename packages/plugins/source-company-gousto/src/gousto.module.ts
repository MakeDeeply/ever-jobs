import { Module } from '@nestjs/common';
import { GoustoService } from './gousto.service';

@Module({ providers: [GoustoService], exports: [GoustoService] })
export class GoustoModule {}
