import { Module } from '@nestjs/common';
import { DelineaService } from './delinea.service';

@Module({ providers: [DelineaService], exports: [DelineaService] })
export class DelineaModule {}
