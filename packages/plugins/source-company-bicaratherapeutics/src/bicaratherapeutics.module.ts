import { Module } from '@nestjs/common';
import { BicaraTherapeuticsService } from './bicaratherapeutics.service';

@Module({ providers: [BicaraTherapeuticsService], exports: [BicaraTherapeuticsService] })
export class BicaraTherapeuticsModule {}
