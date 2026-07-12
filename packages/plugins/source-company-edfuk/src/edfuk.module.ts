import { Module } from '@nestjs/common';
import { EDFUKService } from './edfuk.service';

@Module({ providers: [EDFUKService], exports: [EDFUKService] })
export class EDFUKModule {}
