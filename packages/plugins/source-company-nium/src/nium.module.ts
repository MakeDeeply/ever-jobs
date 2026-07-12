import { Module } from '@nestjs/common';
import { NiumService } from './nium.service';

@Module({ providers: [NiumService], exports: [NiumService] })
export class NiumModule {}
