import { Module } from '@nestjs/common';
import { CustomizedEnergySolutionsService } from './customizedenergysolutions.service';

@Module({ providers: [CustomizedEnergySolutionsService], exports: [CustomizedEnergySolutionsService] })
export class CustomizedEnergySolutionsModule {}
