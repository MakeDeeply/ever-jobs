import { Module } from '@nestjs/common';
import { DroneDeployService } from './dronedeploy.service';

@Module({ providers: [DroneDeployService], exports: [DroneDeployService] })
export class DroneDeployModule {}
