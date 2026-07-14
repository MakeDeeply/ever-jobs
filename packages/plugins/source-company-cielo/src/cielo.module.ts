import { Module } from '@nestjs/common';
import { CieloService } from './cielo.service';

@Module({ providers: [CieloService], exports: [CieloService] })
export class CieloModule {}
