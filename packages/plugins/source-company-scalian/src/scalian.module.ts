import { Module } from '@nestjs/common';
import { ScalianService } from './scalian.service';

@Module({ providers: [ScalianService], exports: [ScalianService] })
export class ScalianModule {}
