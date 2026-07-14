import { Module } from '@nestjs/common';
import { CreativeClicksService } from './creativeclicks.service';

@Module({ providers: [CreativeClicksService], exports: [CreativeClicksService] })
export class CreativeClicksModule {}
