import { Module } from '@nestjs/common';
import { UdacityService } from './udacity.service';

@Module({ providers: [UdacityService], exports: [UdacityService] })
export class UdacityModule {}
