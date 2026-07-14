import { Module } from '@nestjs/common';
import { CanvasMedicalService } from './canvasmedical.service';

@Module({ providers: [CanvasMedicalService], exports: [CanvasMedicalService] })
export class CanvasMedicalModule {}
