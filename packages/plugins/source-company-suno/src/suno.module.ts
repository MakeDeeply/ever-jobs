import { Module } from '@nestjs/common';
import { SunoService } from './suno.service';

@Module({ providers: [SunoService], exports: [SunoService] })
export class SunoModule {}
