import { Module } from '@nestjs/common';
import { RocketLawyerService } from './rocketlawyer.service';

@Module({ providers: [RocketLawyerService], exports: [RocketLawyerService] })
export class RocketLawyerModule {}
