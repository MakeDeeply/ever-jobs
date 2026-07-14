import { Module } from '@nestjs/common';
import { UnitService } from './unit.service';

@Module({ providers: [UnitService], exports: [UnitService] })
export class UnitModule {}
