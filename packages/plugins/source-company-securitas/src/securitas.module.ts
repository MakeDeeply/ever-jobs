import { Module } from '@nestjs/common';
import { SecuritasService } from './securitas.service';

@Module({ providers: [SecuritasService], exports: [SecuritasService] })
export class SecuritasModule {}
