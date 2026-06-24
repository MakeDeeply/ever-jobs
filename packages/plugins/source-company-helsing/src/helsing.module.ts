import { Module } from '@nestjs/common';
import { HelsingService } from './helsing.service';

@Module({ providers: [HelsingService], exports: [HelsingService] })
export class HelsingModule {}
