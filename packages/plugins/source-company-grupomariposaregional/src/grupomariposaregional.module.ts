import { Module } from '@nestjs/common';
import { GrupoMariposaRegionalService } from './grupomariposaregional.service';

@Module({ providers: [GrupoMariposaRegionalService], exports: [GrupoMariposaRegionalService] })
export class GrupoMariposaRegionalModule {}
