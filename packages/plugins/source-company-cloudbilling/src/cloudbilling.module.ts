import { Module } from '@nestjs/common';
import { CloudBillingService } from './cloudbilling.service';

@Module({ providers: [CloudBillingService], exports: [CloudBillingService] })
export class CloudBillingModule {}
