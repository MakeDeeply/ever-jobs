import { Module } from '@nestjs/common';
import { PayterService } from './payter.service';

@Module({ providers: [PayterService], exports: [PayterService] })
export class PayterModule {}
