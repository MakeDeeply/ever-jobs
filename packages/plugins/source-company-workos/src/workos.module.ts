import { Module } from '@nestjs/common';
import { WorkOSService } from './workos.service';

@Module({ providers: [WorkOSService], exports: [WorkOSService] })
export class WorkOSModule {}
