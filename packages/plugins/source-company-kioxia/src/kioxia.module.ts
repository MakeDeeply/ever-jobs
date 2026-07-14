import { Module } from '@nestjs/common';
import { KioxiaService } from './kioxia.service';

@Module({ providers: [KioxiaService], exports: [KioxiaService] })
export class KioxiaModule {}
