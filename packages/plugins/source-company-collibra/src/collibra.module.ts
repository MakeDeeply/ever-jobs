import { Module } from '@nestjs/common';
import { CollibraService } from './collibra.service';

@Module({ providers: [CollibraService], exports: [CollibraService] })
export class CollibraModule {}
