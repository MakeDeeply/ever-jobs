import { Module } from '@nestjs/common';
import { CRBService } from './crb.service';

@Module({ providers: [CRBService], exports: [CRBService] })
export class CRBModule {}
