import { Module } from '@nestjs/common';
import { TheExplorationCompanyService } from './theexplorationcompany.service';

@Module({ providers: [TheExplorationCompanyService], exports: [TheExplorationCompanyService] })
export class TheExplorationCompanyModule {}
