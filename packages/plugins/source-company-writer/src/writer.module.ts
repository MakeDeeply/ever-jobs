import { Module } from '@nestjs/common';
import { WriterService } from './writer.service';

@Module({ providers: [WriterService], exports: [WriterService] })
export class WriterModule {}
