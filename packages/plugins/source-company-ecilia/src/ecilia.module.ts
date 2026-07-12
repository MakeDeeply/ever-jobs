import { Module } from '@nestjs/common';
import { EciliaService } from './ecilia.service';

@Module({ providers: [EciliaService], exports: [EciliaService] })
export class EciliaModule {}
