import { Module } from '@nestjs/common';
import { NorthStarStaffingSolutionsService } from './northstarstaffingsolutions.service';

@Module({ providers: [NorthStarStaffingSolutionsService], exports: [NorthStarStaffingSolutionsService] })
export class NorthStarStaffingSolutionsModule {}
