import { Module } from '@nestjs/common';
import { FixicoService } from './fixico.service';

@Module({ providers: [FixicoService], exports: [FixicoService] })
export class FixicoModule {}
