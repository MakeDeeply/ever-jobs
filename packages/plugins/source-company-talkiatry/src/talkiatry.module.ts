import { Module } from '@nestjs/common';
import { TalkiatryService } from './talkiatry.service';

@Module({ providers: [TalkiatryService], exports: [TalkiatryService] })
export class TalkiatryModule {}
