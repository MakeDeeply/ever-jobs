import { Module } from '@nestjs/common';
import { QventusService } from './qventus.service';

@Module({ providers: [QventusService], exports: [QventusService] })
export class QventusModule {}
