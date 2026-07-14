import { Module } from '@nestjs/common';
import { TheNielsenCompanyService } from './thenielsencompany.service';

@Module({ providers: [TheNielsenCompanyService], exports: [TheNielsenCompanyService] })
export class TheNielsenCompanyModule {}
