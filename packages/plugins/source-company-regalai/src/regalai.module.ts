import { Module } from '@nestjs/common';
import { RegalService } from './regalai.service';

@Module({ providers: [RegalService], exports: [RegalService] })
export class RegalModule {}
