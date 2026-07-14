import { Module } from '@nestjs/common';
import { CityOfPhiladelphiaService } from './cityofphiladelphia.service';

@Module({ providers: [CityOfPhiladelphiaService], exports: [CityOfPhiladelphiaService] })
export class CityOfPhiladelphiaModule {}
