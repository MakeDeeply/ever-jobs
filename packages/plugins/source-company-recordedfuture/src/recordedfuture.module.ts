import { Module } from '@nestjs/common';
import { RecordedFutureService } from './recordedfuture.service';

@Module({ providers: [RecordedFutureService], exports: [RecordedFutureService] })
export class RecordedFutureModule {}
