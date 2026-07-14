import { Module } from '@nestjs/common';
import { AvanceConsultingServicesService } from './avanceconsultingservices.service';

@Module({ providers: [AvanceConsultingServicesService], exports: [AvanceConsultingServicesService] })
export class AvanceConsultingServicesModule {}
