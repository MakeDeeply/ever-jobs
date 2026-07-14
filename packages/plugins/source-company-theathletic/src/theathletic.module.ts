import { Module } from '@nestjs/common';
import { TheAthleticService } from './theathletic.service';

@Module({ providers: [TheAthleticService], exports: [TheAthleticService] })
export class TheAthleticModule {}
