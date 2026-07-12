import { Module } from '@nestjs/common';
import { ReplitService } from './replit.service';

@Module({ providers: [ReplitService], exports: [ReplitService] })
export class ReplitModule {}
