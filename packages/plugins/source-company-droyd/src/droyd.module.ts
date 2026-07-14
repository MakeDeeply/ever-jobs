import { Module } from '@nestjs/common';
import { DroydService } from './droyd.service';

@Module({ providers: [DroydService], exports: [DroydService] })
export class DroydModule {}
