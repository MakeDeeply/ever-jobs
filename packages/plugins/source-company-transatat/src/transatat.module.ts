import { Module } from '@nestjs/common';
import { TransatATService } from './transatat.service';

@Module({ providers: [TransatATService], exports: [TransatATService] })
export class TransatATModule {}
