import { Module } from '@nestjs/common';
import { MediasmartService } from './mediasmart.service';

@Module({ providers: [MediasmartService], exports: [MediasmartService] })
export class MediasmartModule {}
