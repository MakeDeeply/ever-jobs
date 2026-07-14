import { Module } from '@nestjs/common';
import { NielsenIQService } from './nielseniq.service';

@Module({ providers: [NielsenIQService], exports: [NielsenIQService] })
export class NielsenIQModule {}
