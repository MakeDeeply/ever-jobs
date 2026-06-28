import { Module } from '@nestjs/common';
import { CheckbookService } from './checkbook.service';

@Module({ providers: [CheckbookService], exports: [CheckbookService] })
export class CheckbookModule {}
