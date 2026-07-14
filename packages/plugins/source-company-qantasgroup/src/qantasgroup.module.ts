import { Module } from '@nestjs/common';
import { QantasGroupService } from './qantasgroup.service';

@Module({ providers: [QantasGroupService], exports: [QantasGroupService] })
export class QantasGroupModule {}
