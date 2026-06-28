import { Module } from '@nestjs/common';
import { ViaService } from './via.service';

@Module({ providers: [ViaService], exports: [ViaService] })
export class ViaModule {}
