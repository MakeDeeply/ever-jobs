import { Module } from '@nestjs/common';
import { AchieveService } from './achieve.service';

@Module({ providers: [AchieveService], exports: [AchieveService] })
export class AchieveModule {}
