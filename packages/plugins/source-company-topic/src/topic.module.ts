import { Module } from '@nestjs/common';
import { TOPICService } from './topic.service';

@Module({ providers: [TOPICService], exports: [TOPICService] })
export class TOPICModule {}
