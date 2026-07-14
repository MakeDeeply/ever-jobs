import { Module } from '@nestjs/common';
import { CbsCorporateBusinessSolutionsService } from './cbscorporatebusinesssolutions.service';

@Module({ providers: [CbsCorporateBusinessSolutionsService], exports: [CbsCorporateBusinessSolutionsService] })
export class CbsCorporateBusinessSolutionsModule {}
