import { Module } from '@nestjs/common';
import { GrupoMariposaService } from './grupomariposa.service';

@Module({ providers: [GrupoMariposaService], exports: [GrupoMariposaService] })
export class GrupoMariposaModule {}
