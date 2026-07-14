import { Module } from '@nestjs/common';
import { ICTSUKLtdService } from './ictsukltd.service';

@Module({ providers: [ICTSUKLtdService], exports: [ICTSUKLtdService] })
export class ICTSUKLtdModule {}
