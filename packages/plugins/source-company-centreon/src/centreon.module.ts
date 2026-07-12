import { Module } from '@nestjs/common';
import { CentreonService } from './centreon.service';

@Module({ providers: [CentreonService], exports: [CentreonService] })
export class CentreonModule {}
