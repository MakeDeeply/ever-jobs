import { Module } from '@nestjs/common';
import { PikaService } from './pika.service';

@Module({ providers: [PikaService], exports: [PikaService] })
export class PikaModule {}
