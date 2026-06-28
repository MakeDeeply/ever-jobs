import { Module } from '@nestjs/common';
import { SolDeJaneiroService } from './soldejaneiro.service';

@Module({ providers: [SolDeJaneiroService], exports: [SolDeJaneiroService] })
export class SolDeJaneiroModule {}
