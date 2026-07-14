import { Module } from '@nestjs/common';
import { ParkAvenueCoffeeService } from './parkavenuecoffee.service';

@Module({ providers: [ParkAvenueCoffeeService], exports: [ParkAvenueCoffeeService] })
export class ParkAvenueCoffeeModule {}
