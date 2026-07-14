import { Module } from '@nestjs/common';
import { AbridgeService } from './abridge.service';

@Module({ providers: [AbridgeService], exports: [AbridgeService] })
export class AbridgeModule {}
