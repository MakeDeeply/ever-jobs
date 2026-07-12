import { Module } from '@nestjs/common';
import { PickleRobotCompanyService } from './picklerobot.service';

@Module({ providers: [PickleRobotCompanyService], exports: [PickleRobotCompanyService] })
export class PickleRobotCompanyModule {}
