import { Module } from '@nestjs/common';
import { DeliverooService } from './deliveroo.service';

@Module({ providers: [DeliverooService], exports: [DeliverooService] })
export class DeliverooModule {}
