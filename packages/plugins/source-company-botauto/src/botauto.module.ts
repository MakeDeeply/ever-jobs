import { Module } from '@nestjs/common';
import { BotAutoService } from './botauto.service';

@Module({ providers: [BotAutoService], exports: [BotAutoService] })
export class BotAutoModule {}
