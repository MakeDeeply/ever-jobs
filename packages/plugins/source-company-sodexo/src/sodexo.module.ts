import { Module } from '@nestjs/common';
import { SodexoService } from './sodexo.service';

@Module({ providers: [SodexoService], exports: [SodexoService] })
export class SodexoModule {}
