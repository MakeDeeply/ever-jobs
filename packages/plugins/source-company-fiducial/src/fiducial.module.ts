import { Module } from '@nestjs/common';
import { FiducialService } from './fiducial.service';

@Module({ providers: [FiducialService], exports: [FiducialService] })
export class FiducialModule {}
