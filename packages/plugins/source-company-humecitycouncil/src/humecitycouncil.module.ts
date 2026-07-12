import { Module } from '@nestjs/common';
import { HumeCityCouncilService } from './humecitycouncil.service';

@Module({ providers: [HumeCityCouncilService], exports: [HumeCityCouncilService] })
export class HumeCityCouncilModule {}
