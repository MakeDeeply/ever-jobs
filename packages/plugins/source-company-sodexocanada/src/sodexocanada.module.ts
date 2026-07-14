import { Module } from '@nestjs/common';
import { SodexoCanadaService } from './sodexocanada.service';

@Module({ providers: [SodexoCanadaService], exports: [SodexoCanadaService] })
export class SodexoCanadaModule {}
