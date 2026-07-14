import { Module } from '@nestjs/common';
import { ChannableService } from './channable.service';

@Module({ providers: [ChannableService], exports: [ChannableService] })
export class ChannableModule {}
