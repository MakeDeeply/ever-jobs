import { Module } from '@nestjs/common';
import { MagnopusService } from './magnopus.service';

@Module({ providers: [MagnopusService], exports: [MagnopusService] })
export class MagnopusModule {}
