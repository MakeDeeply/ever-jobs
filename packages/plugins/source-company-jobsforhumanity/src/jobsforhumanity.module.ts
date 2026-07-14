import { Module } from '@nestjs/common';
import { JobsForHumanityService } from './jobsforhumanity.service';

@Module({ providers: [JobsForHumanityService], exports: [JobsForHumanityService] })
export class JobsForHumanityModule {}
