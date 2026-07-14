import { Module } from '@nestjs/common';
import { HillstoneRestaurantGroupService } from './hillstonerestaurantgroup.service';

@Module({ providers: [HillstoneRestaurantGroupService], exports: [HillstoneRestaurantGroupService] })
export class HillstoneRestaurantGroupModule {}
