import { Module } from '@nestjs/common';
import { ImplementConsultingGroupService } from './implementconsultinggroup.service';

@Module({ providers: [ImplementConsultingGroupService], exports: [ImplementConsultingGroupService] })
export class ImplementConsultingGroupModule {}
