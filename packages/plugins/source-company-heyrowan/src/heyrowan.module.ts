import { Module } from '@nestjs/common';
import { RowanService } from './heyrowan.service';

@Module({ providers: [RowanService], exports: [RowanService] })
export class RowanModule {}
