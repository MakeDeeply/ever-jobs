import { Module } from '@nestjs/common';
import { ConfluentService } from './confluent.service';

@Module({ providers: [ConfluentService], exports: [ConfluentService] })
export class ConfluentModule {}
