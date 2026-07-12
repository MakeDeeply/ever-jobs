import { Module } from '@nestjs/common';
import { HelloprintService } from './helloprint.service';

@Module({ providers: [HelloprintService], exports: [HelloprintService] })
export class HelloprintModule {}
