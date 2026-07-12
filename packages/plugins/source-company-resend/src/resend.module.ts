import { Module } from '@nestjs/common';
import { ResendService } from './resend.service';

@Module({ providers: [ResendService], exports: [ResendService] })
export class ResendModule {}
