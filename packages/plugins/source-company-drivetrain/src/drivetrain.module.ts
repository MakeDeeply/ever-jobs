import { Module } from '@nestjs/common';
import { DrivetrainService } from './drivetrain.service';

@Module({ providers: [DrivetrainService], exports: [DrivetrainService] })
export class DrivetrainModule {}
