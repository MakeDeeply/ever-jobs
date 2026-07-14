import { Module } from '@nestjs/common';
import { BenutaService } from './benuta.service';

@Module({ providers: [BenutaService], exports: [BenutaService] })
export class BenutaModule {}
