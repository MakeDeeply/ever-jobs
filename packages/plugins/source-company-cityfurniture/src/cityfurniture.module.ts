import { Module } from '@nestjs/common';
import { CityFurnitureService } from './cityfurniture.service';

@Module({ providers: [CityFurnitureService], exports: [CityFurnitureService] })
export class CityFurnitureModule {}
