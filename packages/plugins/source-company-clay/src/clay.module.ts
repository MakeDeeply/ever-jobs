import { Module } from '@nestjs/common';
import { ClayService } from './clay.service';

@Module({ providers: [ClayService], exports: [ClayService] })
export class ClayModule {}
