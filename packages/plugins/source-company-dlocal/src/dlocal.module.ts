import { Module } from '@nestjs/common';
import { DLocalService } from './dlocal.service';

@Module({ providers: [DLocalService], exports: [DLocalService] })
export class DLocalModule {}
