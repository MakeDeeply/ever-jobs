import { Module } from '@nestjs/common';
import { DigitalMediaManagementService } from './digitalmediamanagement.service';

@Module({ providers: [DigitalMediaManagementService], exports: [DigitalMediaManagementService] })
export class DigitalMediaManagementModule {}
