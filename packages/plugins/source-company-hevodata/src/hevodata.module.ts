import { Module } from '@nestjs/common';
import { HevoDataService } from './hevodata.service';

@Module({ providers: [HevoDataService], exports: [HevoDataService] })
export class HevoDataModule {}
