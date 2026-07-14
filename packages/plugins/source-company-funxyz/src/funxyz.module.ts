import { Module } from '@nestjs/common';
import { FunXyzService } from './funxyz.service';

@Module({ providers: [FunXyzService], exports: [FunXyzService] })
export class FunXyzModule {}
