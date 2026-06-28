import { Module } from '@nestjs/common';
import { DaybreakGameCompanyService } from './daybreakgames.service';

@Module({ providers: [DaybreakGameCompanyService], exports: [DaybreakGameCompanyService] })
export class DaybreakGameCompanyModule {}
