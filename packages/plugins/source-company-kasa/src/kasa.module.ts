import { Module } from '@nestjs/common';
import { KasaService } from './kasa.service';

@Module({ providers: [KasaService], exports: [KasaService] })
export class KasaModule {}
