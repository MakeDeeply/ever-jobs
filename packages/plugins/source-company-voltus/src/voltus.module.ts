import { Module } from '@nestjs/common';
import { VoltusService } from './voltus.service';

@Module({ providers: [VoltusService], exports: [VoltusService] })
export class VoltusModule {}
