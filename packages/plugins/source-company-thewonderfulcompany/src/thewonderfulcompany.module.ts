import { Module } from '@nestjs/common';
import { TheWonderfulCompanyService } from './thewonderfulcompany.service';

@Module({ providers: [TheWonderfulCompanyService], exports: [TheWonderfulCompanyService] })
export class TheWonderfulCompanyModule {}
