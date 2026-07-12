import { Module } from '@nestjs/common';
import { StrategicStaffingSolutionsS3Service } from './strategicstaffingsolutionss3.service';

@Module({ providers: [StrategicStaffingSolutionsS3Service], exports: [StrategicStaffingSolutionsS3Service] })
export class StrategicStaffingSolutionsS3Module {}
