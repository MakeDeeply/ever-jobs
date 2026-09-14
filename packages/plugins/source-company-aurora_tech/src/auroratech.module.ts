import { Module } from '@nestjs/common';
import { AuroraTechService } from './auroratech.service';

@Module({ providers: [AuroraTechService], exports: [AuroraTechService] })
export class AuroraTechModule {}
