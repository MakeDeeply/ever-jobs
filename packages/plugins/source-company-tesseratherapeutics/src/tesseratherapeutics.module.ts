import { Module } from '@nestjs/common';
import { TesseraTherapeuticsService } from './tesseratherapeutics.service';

@Module({ providers: [TesseraTherapeuticsService], exports: [TesseraTherapeuticsService] })
export class TesseraTherapeuticsModule {}
