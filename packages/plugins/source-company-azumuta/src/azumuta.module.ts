import { Module } from '@nestjs/common';
import { AzumutaService } from './azumuta.service';

@Module({ providers: [AzumutaService], exports: [AzumutaService] })
export class AzumutaModule {}
