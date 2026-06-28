import { Module } from '@nestjs/common';
import { QualiaService } from './qualia.service';

@Module({ providers: [QualiaService], exports: [QualiaService] })
export class QualiaModule {}
