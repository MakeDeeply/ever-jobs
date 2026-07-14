import { Module } from '@nestjs/common';
import { SpeakeasyService } from './speakeasy.service';

@Module({ providers: [SpeakeasyService], exports: [SpeakeasyService] })
export class SpeakeasyModule {}
