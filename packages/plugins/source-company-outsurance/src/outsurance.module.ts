import { Module } from '@nestjs/common';
import { OUTsuranceService } from './outsurance.service';

@Module({ providers: [OUTsuranceService], exports: [OUTsuranceService] })
export class OUTsuranceModule {}
