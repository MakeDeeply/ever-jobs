import { Module } from '@nestjs/common';
import { CaptivateIQService } from './captivateiq.service';

@Module({ providers: [CaptivateIQService], exports: [CaptivateIQService] })
export class CaptivateIQModule {}
