import { Module } from '@nestjs/common';
import { FlashfoodService } from './flashfood.service';

@Module({ providers: [FlashfoodService], exports: [FlashfoodService] })
export class FlashfoodModule {}
