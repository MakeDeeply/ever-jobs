import { Module } from '@nestjs/common';
import { TahoeTherapeuticsService } from './tahoebioai.service';

@Module({ providers: [TahoeTherapeuticsService], exports: [TahoeTherapeuticsService] })
export class TahoeTherapeuticsModule {}
