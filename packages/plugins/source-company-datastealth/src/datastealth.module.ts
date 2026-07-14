import { Module } from '@nestjs/common';
import { DataStealthService } from './datastealth.service';

@Module({ providers: [DataStealthService], exports: [DataStealthService] })
export class DataStealthModule {}
