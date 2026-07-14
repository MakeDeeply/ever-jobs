import { Module } from '@nestjs/common';
import { ServiceNowService } from './servicenow.service';

@Module({ providers: [ServiceNowService], exports: [ServiceNowService] })
export class ServiceNowModule {}
