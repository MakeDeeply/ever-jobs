import { Module } from '@nestjs/common';
import { WindfallService } from './windfalldata.service';

@Module({ providers: [WindfallService], exports: [WindfallService] })
export class WindfallModule {}
