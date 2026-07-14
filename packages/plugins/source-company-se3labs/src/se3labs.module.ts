import { Module } from '@nestjs/common';
import { SE3LabsService } from './se3labs.service';

@Module({ providers: [SE3LabsService], exports: [SE3LabsService] })
export class SE3LabsModule {}
