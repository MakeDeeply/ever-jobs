import { Module } from '@nestjs/common';
import { ProSidianConsultingService } from './prosidianconsulting.service';

@Module({ providers: [ProSidianConsultingService], exports: [ProSidianConsultingService] })
export class ProSidianConsultingModule {}
