import { Module } from '@nestjs/common';
import { AskITConsultingService } from './askitconsulting.service';

@Module({ providers: [AskITConsultingService], exports: [AskITConsultingService] })
export class AskITConsultingModule {}
