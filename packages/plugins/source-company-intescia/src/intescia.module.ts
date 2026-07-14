import { Module } from '@nestjs/common';
import { IntesciaService } from './intescia.service';

@Module({ providers: [IntesciaService], exports: [IntesciaService] })
export class IntesciaModule {}
