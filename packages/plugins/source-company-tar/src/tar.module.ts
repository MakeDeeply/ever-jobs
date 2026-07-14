import { Module } from '@nestjs/common';
import { TARService } from './tar.service';

@Module({ providers: [TARService], exports: [TARService] })
export class TARModule {}
