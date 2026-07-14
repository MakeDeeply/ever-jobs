import { Module } from '@nestjs/common';
import { DecagonService } from './decagon.service';

@Module({ providers: [DecagonService], exports: [DecagonService] })
export class DecagonModule {}
