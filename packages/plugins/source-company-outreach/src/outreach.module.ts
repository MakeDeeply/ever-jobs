import { Module } from '@nestjs/common';
import { OutreachService } from './outreach.service';

@Module({ providers: [OutreachService], exports: [OutreachService] })
export class OutreachModule {}
