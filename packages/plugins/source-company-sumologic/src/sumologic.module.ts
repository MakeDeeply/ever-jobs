import { Module } from '@nestjs/common';
import { SumoLogicService } from './sumologic.service';

@Module({ providers: [SumoLogicService], exports: [SumoLogicService] })
export class SumoLogicModule {}
