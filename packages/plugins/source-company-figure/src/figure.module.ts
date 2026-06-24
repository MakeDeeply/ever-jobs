import { Module } from '@nestjs/common';
import { FigureLendingService } from './figure.service';

@Module({ providers: [FigureLendingService], exports: [FigureLendingService] })
export class FigureLendingModule {}
