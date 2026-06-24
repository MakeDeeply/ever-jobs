import { Module } from '@nestjs/common';
import { CorticaService } from './cortica.service';

@Module({ providers: [CorticaService], exports: [CorticaService] })
export class CorticaModule {}
