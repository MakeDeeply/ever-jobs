import { Module } from '@nestjs/common';
import { GridCAREService } from './gridcare.service';

@Module({ providers: [GridCAREService], exports: [GridCAREService] })
export class GridCAREModule {}
