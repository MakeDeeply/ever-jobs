import { Module } from '@nestjs/common';
import { PyramidConsultingService } from './pyramidconsulting.service';

@Module({ providers: [PyramidConsultingService], exports: [PyramidConsultingService] })
export class PyramidConsultingModule {}
