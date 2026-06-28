import { Module } from '@nestjs/common';
import { RokuService } from './roku.service';

@Module({ providers: [RokuService], exports: [RokuService] })
export class RokuModule {}
