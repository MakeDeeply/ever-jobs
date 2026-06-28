import { Module } from '@nestjs/common';
import { PayoneerService } from './payoneer.service';

@Module({ providers: [PayoneerService], exports: [PayoneerService] })
export class PayoneerModule {}
