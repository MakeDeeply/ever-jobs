import { Module } from '@nestjs/common';
import { CornerstoneBuildingBrandsService } from './cornerstonebuildingbrands.service';

@Module({ providers: [CornerstoneBuildingBrandsService], exports: [CornerstoneBuildingBrandsService] })
export class CornerstoneBuildingBrandsModule {}
