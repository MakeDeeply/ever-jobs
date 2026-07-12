import { Module } from '@nestjs/common';
import { BasePowerCompanyService } from './basepowercompany.service';

@Module({ providers: [BasePowerCompanyService], exports: [BasePowerCompanyService] })
export class BasePowerCompanyModule {}
