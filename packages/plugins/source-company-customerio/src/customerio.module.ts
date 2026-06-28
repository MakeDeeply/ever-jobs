import { Module } from '@nestjs/common';
import { CustomerIoService } from './customerio.service';

@Module({ providers: [CustomerIoService], exports: [CustomerIoService] })
export class CustomerIoModule {}
