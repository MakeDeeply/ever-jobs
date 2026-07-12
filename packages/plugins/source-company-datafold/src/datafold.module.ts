import { Module } from '@nestjs/common';
import { DatafoldService } from './datafold.service';

@Module({ providers: [DatafoldService], exports: [DatafoldService] })
export class DatafoldModule {}
