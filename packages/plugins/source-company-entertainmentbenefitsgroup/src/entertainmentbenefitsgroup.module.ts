import { Module } from '@nestjs/common';
import { EntertainmentBenefitsGroupService } from './entertainmentbenefitsgroup.service';

@Module({ providers: [EntertainmentBenefitsGroupService], exports: [EntertainmentBenefitsGroupService] })
export class EntertainmentBenefitsGroupModule {}
