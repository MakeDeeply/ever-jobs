import { Module } from '@nestjs/common';
import { PicnicDeliveryService } from './try-picnic.service';

@Module({ providers: [PicnicDeliveryService], exports: [PicnicDeliveryService] })
export class PicnicDeliveryModule {}
