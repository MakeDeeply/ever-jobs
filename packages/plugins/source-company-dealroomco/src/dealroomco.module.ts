import { Module } from '@nestjs/common';
import { DealroomCoService } from './dealroomco.service';

@Module({ providers: [DealroomCoService], exports: [DealroomCoService] })
export class DealroomCoModule {}
