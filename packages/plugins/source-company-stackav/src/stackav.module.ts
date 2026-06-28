import { Module } from '@nestjs/common';
import { StackAVService } from './stackav.service';

@Module({ providers: [StackAVService], exports: [StackAVService] })
export class StackAVModule {}
