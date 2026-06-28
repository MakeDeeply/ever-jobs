import { Module } from '@nestjs/common';
import { PubMaticService } from './pubmatic.service';

@Module({ providers: [PubMaticService], exports: [PubMaticService] })
export class PubMaticModule {}
