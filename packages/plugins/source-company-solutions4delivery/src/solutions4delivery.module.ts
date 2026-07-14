import { Module } from '@nestjs/common';
import { Solutions4DeliveryService } from './solutions4delivery.service';

@Module({ providers: [Solutions4DeliveryService], exports: [Solutions4DeliveryService] })
export class Solutions4DeliveryModule {}
