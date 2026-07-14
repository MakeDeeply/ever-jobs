import { Module } from '@nestjs/common';
import { RedCanyonEngineeringSoftwareService } from './redcanyonsoftware.service';

@Module({ providers: [RedCanyonEngineeringSoftwareService], exports: [RedCanyonEngineeringSoftwareService] })
export class RedCanyonEngineeringSoftwareModule {}
