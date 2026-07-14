import { Module } from '@nestjs/common';
import { LakeshoreLearningMaterialsService } from './lakeshorelearningmaterials.service';

@Module({ providers: [LakeshoreLearningMaterialsService], exports: [LakeshoreLearningMaterialsService] })
export class LakeshoreLearningMaterialsModule {}
