import { Module } from '@nestjs/common';
import { BoxLunchHotTopicService } from './boxlunch.service';

@Module({ providers: [BoxLunchHotTopicService], exports: [BoxLunchHotTopicService] })
export class BoxLunchHotTopicModule {}
