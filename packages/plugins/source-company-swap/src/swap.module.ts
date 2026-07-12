import { Module } from '@nestjs/common';
import { SwapService } from './swap.service';

@Module({ providers: [SwapService], exports: [SwapService] })
export class SwapModule {}
