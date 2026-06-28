import { Module } from '@nestjs/common';
import { EnergySolutionsService } from './energysolutions.service';

@Module({ providers: [EnergySolutionsService], exports: [EnergySolutionsService] })
export class EnergySolutionsModule {}
