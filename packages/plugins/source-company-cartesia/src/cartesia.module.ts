import { Module } from '@nestjs/common';
import { CartesiaService } from './cartesia.service';

@Module({ providers: [CartesiaService], exports: [CartesiaService] })
export class CartesiaModule {}
