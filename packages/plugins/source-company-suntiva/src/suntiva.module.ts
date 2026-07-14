import { Module } from '@nestjs/common';
import { SuntivaService } from './suntiva.service';

@Module({ providers: [SuntivaService], exports: [SuntivaService] })
export class SuntivaModule {}
