import { Module } from '@nestjs/common';
import { StandardBankGroupService } from './standardbankgroup.service';

@Module({ providers: [StandardBankGroupService], exports: [StandardBankGroupService] })
export class StandardBankGroupModule {}
