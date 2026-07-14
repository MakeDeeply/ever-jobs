import { Module } from '@nestjs/common';
import { NeonService } from './neon.service';

@Module({ providers: [NeonService], exports: [NeonService] })
export class NeonModule {}
